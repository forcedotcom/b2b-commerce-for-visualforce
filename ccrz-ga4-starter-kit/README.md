# CloudCraze GA4 Starter Kit

## Google Announcement

>Google Analytics 4 is replacing Universal Analytics. On July 1, 2023 all standard Universal Analytics properties will stop processing new hits. 360 Universal Analytics properties will stop processing new hits on July 1, 2024.
...
The earlier you migrate, the more historical data and insights you will have in Google Analytics 4.
...
analytics.js is a legacy library. If you are starting a new implementation, we recommend you use the gtag.js library. For existing implementations, learn how to [migrate from analytics.js to gtag.js](https://developers.google.com/analytics/devguides/migration/ua/analyticsjs-to-gtagjs).



## How GA is implemented in CCRZ

CCRZ does not track Google Analytics by default. This must be enabled in the B2B Commerce Admin. If an admin adds the configuration setting for Google Analytics Tracking ID ([instructions here](https://help.salesforce.com/s/articleView?id=sf.b2b_commerce_google_analytics_start.htm&type=5)), a snippet of code will execute on pages matching the Page attribute for the config setting—typically this is set to “all”.

**src/components/HeadIncludes.component**

```
<apex:outputPanel layout="none" rendered="{!NOT(ISBLANK(gaTrackingId))}">
<!-- Google Analytics -->
<script type="text/javascript">
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', {
        trackingId: '{!JSENCODE(gaTrackingId)}'
        , cookieDomain: 'auto'
        , userId : '{!JSENCODE(gaUserId)}'.substr(0,15)
        , name: '{!JSENCODE(gaTrackerName)}'
    });
    ga('{!JSENCODE(gaTrackerName)}.require', 'ecommerce');
    CCRZ.ga = {
        'trackingId': '{!JSENCODE(gaTrackingId)}'
        , 'trackerName': '{!JSENCODE(gaTrackerName)}'
        , 'anonymizeIp': {!IF(true == gaAnonymizeIp, true, false)}
    }
</script>
<!-- End Google Analytics -->
</apex:outputPanel>
```

**staticresources/CC_Javascript_Framework.resource/js/analytics.js** defines the following functions:

```
CCRZ.ga.sendPageview
CCRZ.ga.sendTransaction
CCRZ.ga.sendLLIOrderTransaction
CCRZ.ga.sendEvent
CCRZ.ga.sendException
CCRZ.ga.pageviewParams
CCRZ.ga.safeParams
CCRZ.ga.sendPageview
CCRZ.ga.handleProductDetails
CCRZ.ga.handleProductList
CCRZ.ga.handleFeatureFilter
CCRZ.ga.handleAddToCart
CCRZ.ga.handleCartContinueShopping
CCRZ.ga.handleCartCheckout
CCRZ.ga.handleApplyCoupon
CCRZ.ga.handleSubmitOrder
CCRZ.ga.handlePageMessage
CCRZ.ga.handleSearch2
CCRZ.ga.handlePromotions
```

**analytics.js** also sets up a few pubsub listeners:

```
CCRZ.pubSub.**on**('pageMessage', CCRZ.ga.handlePageMessage, this);
CCRZ.pubSub.**on**('model:collectionsProductList:fetch', CCRZ.ga.handleSearch2);
CCRZ.pubSub.**on**('view:PromoDisp:rendered', CCRZ.ga.handlePromotions);
```

We have over 50 places throughout the pages that call CCRZ.ga functions as events and transactions take place.

Snippet from **cc_CheckoutShippingRD.component**

```
if (CCRZ.ga) {
    CCRZ.ga.sendPageview(_.extend({'source':'Checkout'}, CCRZ.pagevars), {
        'title': 'Checkout - Shipping Information'
        , 'page':[ window.location.pathname, CCRZ.ga.safeParams() ].join('?')
    });
}
```

## How to Switch

Moving from GA to GA4 in CloudCraze involves the following high-level steps:

* Set up Google Analytics 4
* Update and deploy code:
    * Update and deploy the GA4UserInterface.cls apex class that extends ccrz.cc_hk_UserInterface.
    * Update and deploy the GA4 static resource containing the CCRZ.ga analytics function overrides.
* Update configuration settings:
    * Add new configuration setting for GA4 Measurement ID.
    * Remove Google Analytics Tracking ID configuration setting.
    * TODO: add the new user interface class override
    * Rebuild configuration cache.
* Verify it’s working

### Set Up Google Analytics 4

Google had documented how to set up GA4 along side GA in this guide: [[GA4] Add a Google Analytics 4 property (to a site that already has Analytics)](https://support.google.com/analytics/answer/9744165?sjid=13091597078223838629-NA#zippy=%2Cin-this-article). Some notable mentions from this guide:

* This activates enhanced measurement by default in the new GA4 property. Enhanced measurement automatically tracks various common events. This may or may not be desirable for your situation. See [[GA4] Enhanced event measurement](https://support.google.com/analytics/answer/9216061?sjid=13091597078223838629-NA) for more info and steps to disable if desired.

### Update and Deploy Code

**Extend cc_hk_UserInterface**

* Create a new Apex Class that extends ccrz.cc_hk_UserInterface.v004. Note v004 is the most recent version of the CloudCraze user interface.
* The provided example GA4UserInterface.cls inserts the necessary GA4 content in the <head> tag before the CloudCraze standard includes.
    * Source code can be found in the ccrz-ga4-starter-kit git repository.
    * https://git.soma.salesforce.com/cloudcraze/ccrz-ga4-starter-kit/blob/main/force-app/main/default/classes/GA4UserInterface.cls

For more information on extending ccrz.cc_hk_UserInterface, see the [B2B Commerce for Visualforce Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.noversion.b2b_commerce_dev_guide.meta/b2b_commerce_dev_guide/ccrz_cc_hk_UserInterface.htm).

**Override the CCRZ analytics javascript functions**

The provided javascript file ga4analytics.js contains an implementation of CCRZ.ga. This handles initializing the GA4 config and overrides the OOTB CCRZ.ga functions for sending data to GA4.

* Source code can be found in the ccrz-ga4-starter-kit git repository.
* https://git.soma.salesforce.com/cloudcraze/ccrz-ga4-starter-kit/blob/main/force-app/main/default/staticresources/GA4Analytics/ga4analytics.js


**Update Store to use G4UserInterface**

* Navigate to the CC Admin tab.
* Select the store in the store dropdown to go to store settings.
* Click Themes on the left.
* Scroll to the bottom and set User Interface Extension API Class to `c.GA4UserInterface`
* Click Save
    * *Note: this change is effective immediately.*


TODO: determine best way to distribute the code


### Update Configuration Settings

The CCRZ component HeadIncludes adds the GA includes and init javascript. To prevent this from executing, remove the configuration setting Google Analytics Tracking ID.

* Navigate to the CC Admin tab.
* Select the store in the store dropdown to go to store settings.
* Click Configuration Settings on the left.
* Select Module Analytics.
* Ensure Google Analytics Tracking ID is not set. If it is set, click Delete in the action column to remove it.

Add the new GA4 Measurement ID configuration setting:

* Navigate to the CC Admin tab.
* Click Configuration Modules in the GLOBAL SETTINGS on the left.
* Click the Analytics module.
* Click New next to Configuration Metadata.
    * Name: GA4 Measurement ID
    * API Name: ga4id
    * Description: Google Analytics 4 measurement ID
    * Externally Safe: leave unchecked
* Click Save
* Select the store in the store dropdown to go to store settings.
* Click Configuration Settings on the left.
* Click New
    * Module: Analytics
    * Configuration: GA4 Measurement ID
    * Page: all
    * Set Value to the MEASUREMENT ID from GA4 Data Stream settings
* Click Save

#### Verify It’s Working

Bring up your store and verify you see tracking happening in GA4.

Google debugging tools:

* GA4 provides a way to [[GA4] Monitor events in DebugView](https://support.google.com/analytics/answer/7201382?hl=en&utm_id=ad).
* Google also provides a [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) chrome plugin that allows viewing analytics events in the developer console output.

## Additional Info

GA4 has a set of recommended events to track for commerce sites. These guides describe the recommended events and how to track them with GA4:

* [[GA4] Recommended events](https://support.google.com/analytics/answer/9267735?hl=en&ref_topic=13367566)
* [Measure ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag)



