# B2B Commerce for Visualforce

Further integrate your fully featured Visualforce storefront with an Experience Builder site, and deliver a smooth transitional experience for your buyers across your solution.

This guide describes how to deploy the B2B Commerce Header component using Salesforce CLI (https://developer.salesforce.com/tools/sfdxcli).

## Prerequisites

* An org with B2B Commerce for Visualforce Winter ‘21 (version 4.13) installed
* An Experience Cloud site that uses an Experience Builder template.
* Salesforce CLI set up
  * https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm

## Get the Code

Clone the b2b-commerce-for-visualforce repo.

```
git clone git@github.com:forcedotcom/b2b-commerce-for-visualforce.git
```

## Connect SFDX to your org

Navigate to the project directory.

```
cd b2b-commerce-for-visualforce
```

If you haven’t already created an SFDX connection to the org, use the following command. The `-s` parameter sets the org as default for the current project. Replace `myorg` with an alias that you want to use.

```
sfdx force:auth:web:login -s -a myorg
```

If you already have a connection to the QA org, or forgot the `-s` parameter, set the QA org as the default for the current project. Replace `myqa` with the alias of your QA org.

```
sfdx force:config:set defaultusername=myorg
```

## Deploy the B2B Commerce Header Component

Deploy the component using the `force:source:deploy` command.

```
sfdx force:source:deploy -m LightningComponentBundle
```

## Add the B2B Commerce Header Component to your Experience Builder Site

You can login to your org using the following SFDX command.

```
sfdx force:org:open
```

* From Setup, enter `All Sites` in the Quick Find box, and then select **All Sites**.
* Click **Builder** next to the site that you want to use.
* In Experience Builder, drag the **B2B Commerce Header (Unmanaged)** component and drop it on the header section of the page.
* Click **Publish**.

The default component is styled for the Capricorn Coffee demo theme, and uses Google fonts. To continue using Google fonts and avoid CSP warnings, add the following CSP entries:
* From Setup, select **CSP Trusted Sites**.
* Click **New Trusted Site**.
* Set the following values:
  * **Trusted Site Name:** Google_Fonts_CSS
  * **Trusted Site URL:** https://fonts.googleapis.com
  * **Active:** Enabled
  * **Context:** Experience Builder Sites
  * Under **CSP Directives**, enable **Allow site for style-src**.

* Click **New Trusted Site**.
* Set the following values:
  * **Trusted Site Name:** Google_Static_Fonts
  * **Trusted Site URL:** https://fonts.gstatic.com
  * **Active:** Enabled
  * **Context:** Experience Builder Sites
  * Under **CSP Directives**, enable **Allow site for font-src**.

## Customize the Components

You can now customize the components for your storefront's brand identity. First, modify the components in the `force-app/main/default/lwc` directory, then push to the org using your IDE or using the `force:source:deploy` SFDX command.

```
sfdx force:source:deploy -m LightningComponentBundle
```

To change the theme that the B2B Commerce Header component uses, modify line 11 in `b2b_Header.js` and deploy the changes. For example:

```
import themeResource from '@salesforce/resourceUrl/MyStorefrontTheme';
```
This change causes the header to look for the `styles.css` in a B2B Commerce theme static resource called `MyStorefrontTheme`.