# B2B Commerce for Visualforce

Further integrate your fully featured Visualforce storefront with an Experience Builder site, and deliver a smooth transitional experience for your buyers across your solution.

This steps through deploying the Header components using SFDX.

## Prerequisites

* An org with B2B Commerce Winter ‘21 release (Version 4.13) installed
* A community using a Builder template
* SFDX set up

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

If you haven’t already created an SFDX connection to the org, use the following to do so. The -s param sets the org as default for the current project. Replace myorg with an alias you want to use.

```
sfdx force:auth:web:login -s -a myorg
```

If you already have a connection to the QA org, or forgot the -s above, set it as the default for the current project. Replace myqa with the alias of your QA org.

```
sfdx force:config:set defaultusername=myorg
```

## Deploy LWC Header Components

Deploy the components using the force:source:deploy command.

```
sfdx force:source:deploy -m LightningComponentBundle
```

## Add the Header to your Community

You can login to your org using the following SFDX command.

```
sfdx force:org:open
```

* From Setup > **All Communities**, click **Builder** next to the community you want to add the B2B Commerce Header to.
* In Builder, drag and drop the component **B2B Commerce Header (Unmanaged)** to the header section of the page.
* Click **Publish**.

## Making Changes

You can now make custom changes to the components. To do this, modify the components in the force-app/main/default/lwc directory, then push to the org using your IDE or using the SFDX force:source:deploy command.

```
sfdx force:source:deploy -m LightningComponentBundle
```

To change the theme used by the B2B Commerce Header, modify line 11 in b2b_Header.js and deploy the changes. For example:

```
import themeResource from '@salesforce/resourceUrl/MyStorefrontTheme';
```
This will look for the Styles.css in a B2B Commerce theme static resource called MyStorefrontTheme.
