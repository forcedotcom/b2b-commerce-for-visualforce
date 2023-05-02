# Google Analytics 4 and Salesforce B2B Commerce for Visualforce

Google [announced that Google Analytics 4 is replacing Universal Analytics](https://support.google.com/analytics/answer/10759417):

>Google Analytics 4 is replacing Universal Analytics. On July 1, 2023 all standard Universal Analytics properties will stop processing new hits. 360 Universal Analytics properties will stop processing new hits on July 1, 2024.
...
The earlier you migrate, the more historical data and insights you will have in Google Analytics 4.
...
analytics.js is a legacy library. If you are starting a new implementation, we recommend you use the gtag.js library. For existing implementations, learn how to [migrate from analytics.js to gtag.js](https://developers.google.com/analytics/devguides/migration/ua/analyticsjs-to-gtagjs).

This change affects B2B Commerce for Visualforce storefronts that currently enable Google Analytics for tracking activity, which relies on Universal Analytics.

## Current Google Analytics Implementation in B2B Commerce for Visualforce

B2B Commerce for Visualforce doesn't track Google Analytics by default, but admins can connect a Google Analytics property to their storefront by [specifying a Google Analytics Tracking ID in storefront configuration settings](https://help.salesforce.com/s/articleView?id=sf.b2b_commerce_google_analytics_start.htm&type=5). The following code snippet--defined in `src/components/HeadIncludes.component` in the B2B Commerce for Visualforce managed package--executes on storefront pages that the configuration setting applies to (typically, all pages).

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

The `staticresources/CC_Javascript_Framework.resource/js/analytics.js` file in the B2B Commerce for Visualforce managed package also defines the following functions:

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

The `analytics.js` file also defines some `CCRZ.PubSub` event listeners:

```
CCRZ.pubSub.**on**('pageMessage', CCRZ.ga.handlePageMessage, this);
CCRZ.pubSub.**on**('model:collectionsProductList:fetch', CCRZ.ga.handleSearch2);
CCRZ.pubSub.**on**('view:PromoDisp:rendered', CCRZ.ga.handlePromotions);
```

There are more than 50 instances in default storefront pages that call `CCRZ.ga` functions. For example, this snippet from `cc_CheckoutShippingRD.component`:

```
if (CCRZ.ga) {
    CCRZ.ga.sendPageview(_.extend({'source':'Checkout'}, CCRZ.pagevars), {
        'title': 'Checkout - Shipping Information'
        , 'page':[ window.location.pathname, CCRZ.ga.safeParams() ].join('?')
    });
}
```

## Switch Your Storefront to Google Analytics 4

To update your current Google Analytics implementation on a storefront from Universal Analytics to Google Analytics 4, complete these high-level steps, which are described in more detail below.

1. Set up Google Analytics 4.
2. Update and deploy code.
    a. Update and deploy the `GA4UserInterface.cls` custom Apex class that extends the `ccrz.cc_hk_UserInterface` extension point class.
    b. Update and deploy the Google Analytics 4 static resource that contains the `CCRZ.ga` JavaScript function overrides.
3. Update your storefront settings.
    a. Remove the current Google Analytics Tracking ID configuration setting.
    b. Add the new GA4 Measurement ID configuration setting.
    c. Specify the custom Apex class as the User Interface Extension API Class in your storefront settings.
    d. Build and activate a new configuration cache.
4. Verify that Google Analytics 4 is working on your storefront.

### Set Up Google Analytics 4

Complete the steps in the Google Analytics Help article, [[GA4] Add a Google Analytics 4 property (to a site that already has Analytics)](https://support.google.com/analytics/answer/9744165?sjid=13091597078223838629-NA#zippy=%2Cin-this-article).

NOTE: Completing these steps activates enhanced measurement in the new Google Analytics 4 property by default. Enhanced measurement automatically tracks various common events. If you prefer not to track these events, see [[GA4] Enhanced event measurement](https://support.google.com/analytics/answer/9216061?sjid=13091597078223838629-NA) for information about disabling this behavior.

### Update and Deploy Code

**Extend `ccrz.cc_hk_UserInterface`**

1. Create an Apex class that extends the `ccrz.cc_hk_UserInterface.v004` extension point class. The `v004` inner class defines the most recent default libraries and logic for evaluating configuration setting values.
2. The provided example class, `GA4UserInterface.cls`, inserts the necessary GA4 content in the `<head>` tag before the standard included libraries.

    Find the example class in the `ccrz-ga4-starter-kit` folder in this repository: https://github.com/forcedotcom/b2b-commerce-for-visualforce/blob/main/ccrz-ga4-starter-kit/force-app/main/default/classes/GA4UserInterface.cls

For more information on extending `ccrz.cc_hk_UserInterface`, see the [B2B Commerce for Visualforce Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.noversion.b2b_commerce_dev_guide.meta/b2b_commerce_dev_guide/ccrz_cc_hk_UserInterface.htm).

**Override the Default `CCRZ.ga` Javascript Functions**

The provided `ga4analytics.js` file contains an implementation of `CCRZ.ga` that initializes the GA4 configuration and overrides the default `CCRZ.ga` functions for sending data to GA4.

Find this file in the `ccrz-ga4-starter-kit` folder in this repository: https://github.com/forcedotcom/b2b-commerce-for-visualforce/blob/main/ccrz-ga4-starter-kit/force-app/main/default/staticresources/GA4Analytics/ga4analytics.js


**Update Your Storefront to Reference `G4UserInterface.cls`**

1. On the CC Admin tab in your org, select your storefront.
2. In the Storefront Settings menu, scroll to the Appearance section, and select *Themes*.
3. Scroll to the User Interface Extension Settings section, and for User Interface Extension API Class, enter `c.GA4UserInterface`.
4. Save your changes.

    Note: This change is effective immediately.

### Update Storefront Configuration Settings

Remove the current Google Analytics Tracking ID configuration setting to prevent the `HeadIncludes` component from executing the default Google Analytics behavior.

1. On the CC Admin tab in your org, select your storefront.
2. In the Storefront Settings menu, select *Configuration Settings*.
3. From the Module picklist, select *Analytics*.
4. If the Google Analytics Tracking ID configuration is set, click *Delete* in the Action column.

Add the new GA4 Measurement ID configuration metadata and set its value on your storefront.

1. On the CC Admin tab in your org, select *Global Settings* from the storefront picklist.
2. Select *Configuration Modules* from the Global Settings menu.
3. From the Configuration Modules list, select *Analytics*.
4. Click *New* and enter these details in the Configuration Metadata window.
    a. For Name, enter `GA4 Measurement ID`.
    b. For API Name, enter `ga4id`.
    c. For Description, enter `Google Analytics 4 measurement ID`.
    d. For Externally Safe, leave unselected (a value of `false`).
5. Save your changes.
6. Select your storefront from the storefront picklist.
7. In the Storefront Settings menu, select *Configuration Settings*.
8. Click *New* and enter these values in the New Page Setting window.
    a. For Module, enter `Analytics`.
    b. For Configuration, enter `GA4 Measurement ID`.
    c. For Page, enter `all`.
    d. For Value, enter the MEASUREMENT ID from your GA4 Data Stream settings.
9. Save your changes.
10. Build and activate a new configuration cache.

#### Verify That Google Analytics 4 is Working on Your Storefront

Visit your storefront and verify that Google Analytics 4 is tracking your activity.

Google provides these debugging tools to help you.

* [[GA4] Monitor events in DebugView](https://support.google.com/analytics/answer/7201382?hl=en&utm_id=ad)
* [Google Analytics Debugger plugin for Google Chrome to view analytics events in the developer console output](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)

## Additional Resources

GA4 defines a set of recommended events to track on commerce sites. These guides describe the recommended events and how to track them with GA4.

* [[GA4] Recommended events](https://support.google.com/analytics/answer/9267735?hl=en&ref_topic=13367566)
* [Measure ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag)