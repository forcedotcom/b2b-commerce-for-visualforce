/**
 * Google Analytics 4 Initialization and Events
 */
if(!this.CCRZ) {
	this.CCRZ = {};
}

(function(CCRZ, window) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-5F9T4YWQSG', {
        'send_page_view': false,
        'debug_mode': true
    });

    CCRZ.ga = {'gTagId': 'G-5F9T4YWQSG'};

    CCRZ.ga.eventMap = {
        'Viewed a Product': 'view_item',
        'Viewed a Promotion': 'view_promotion',
        'Viewed a Category': 'view_item_list',
        'Applied a Filter': 'view_item_list',
        'Added Product To Cart': 'add_to_cart',
        'Clicked Continue Shopping': 'button_click', // not standard ga4
        'Started Checkout': 'begin_checkout',
        'Applied a Coupon': 'add_to_cart',
        'Submitted an Order': 'purchase',
        'Search with Results': 'search',
        'Search with No Results': 'search',
        'Viewed a Promotion': 'view_promotion',
        'Viewed an Order': 'view_order', // not standard ga4
        'Exception': 'exception' // not standard ga4
    };

    CCRZ.ga.sendPageview = function(context, pageData, hitCallback) {
        console.log("[ga4] sendPageview");

        var ga4params = {'send_to': this.gTagId};

        if (pageData.page) {
            // assumes root path such as location.pathname
            ga4params.page_path = pageData.page;
        }
        if (pageData.title) {
            ga4params.page_title = pageData.title;
        }

        gtag('event', 'page_view', ga4params);
    };

    CCRZ.ga.sendEvent = function(context, eventData, hitCallback) {
        console.log("[ga4] sendEvent");
        // eventData.eventCategory and eventAction are required
        var gaEv = {
            'hitType': 'event'
            , 'eventCategory' : eventData['eventCategory']
            , 'eventAction' : eventData['eventAction']
        };
        if (eventData['eventLabel']) { gaEv['eventLabel'] = eventData['eventLabel']; }
        if (jQuery.isNumeric(eventData['eventValue'])) {
            gaEv['eventValue'] = eventData['eventValue'];
        }
        if (eventData['transport']) { gaEv['transport'] = eventData['transport']; } // transport:beacon support
        if (eventData['nonInteraction']) { gaEv['nonInteraction'] = eventData['nonInteraction']; } // non-interaction support

        var ga4eventName = CCRZ.ga.eventMap[eventData['eventAction']];

        if(ga4eventName) {
            gtag('event', ga4eventName, gaEv);
        }

        if (typeof hitCallback === 'function') { hitCallback(); }
    };

    CCRZ.ga.sendTransaction = function(context, txnData, hitCallback) {
        console.log("[ga4] sendTransaction");

        // assumes order detail model
        var gaTxn = {
            'id': txnData.attributes.encryptedId
            , 'affiliation': txnData.attributes['storefront']
            , 'revenue': txnData.attributes['totalAmount']
            , 'currency': txnData.attributes['currencyCode']
            , 'eventAction': 'Viewed an Order'
            , 'items': []
        }
        if (jQuery.isNumeric(txnData.attributes['shippingCharge'])) {
            gaTxn['shipping'] = txnData.attributes['shippingCharge'];
        }
        if (jQuery.isNumeric(txnData.attributes['tax'])) {
            gaTxn['tax'] = txnData.attributes['tax'];
        }
        if (typeof hitCallback === 'function') { gaTxn['hitCallback'] = hitCallback; }

        _.each(txnData.attributes.orderItems, function(orderItem) {
            var gaItem = {
                'id': txnData.attributes.encryptedId
                , 'name': orderItem.mockProduct['sfdcName']
                , 'sku': orderItem.mockProduct['SKU']
                , 'price': orderItem['originalItemPrice']
                , 'quantity': orderItem['quantity']
                , 'currency': txnData.attributes['currencyCode']
            }
            gaTxn.items.push(gaItem);
        });
        CCRZ.ga.sendEvent(context, gaTxn, hitCallback);
    };

    CCRZ.ga.sendLLIOrderTransaction = function(context, txnData, hitCallback) {
        console.log("[ga4] sendLLIOrderTransaction");
        // assumes lli order detail model
        var orderItems = [];
        var gaItems = [];
        var mergedGAItems = [];
        var gaTxn = {
            'id': txnData.attributes.orderEncId
            , 'affiliation': txnData.attributes.orderStorefront
            , 'revenue': txnData.attributes['orderData'].totalAmount
            , 'currency': txnData.attributes['orderData'].currencyISOCode
            , 'eventAction': 'Viewed an Order'
        }
        if (jQuery.isNumeric(txnData.attributes['orderData'].shipAmount)) {
            gaTxn['shipping'] = txnData.attributes['orderData'].shipAmount;
        }
        if (jQuery.isNumeric(txnData.attributes['orderData'].taxAmount)) {
            gaTxn['tax'] = txnData.attributes['orderData'].taxAmount;
        }
        if (typeof hitCallback === 'function') { gaTxn['hitCallback'] = hitCallback; }

        if (txnData.attributes['orderData']['EOrderItemGroupsS']) {
            _.each(txnData.attributes['orderData'].EOrderItemGroupsS.models, function (orderItemGroup) {
                // append orderItems from all the shipping groups
                orderItems = orderItems.concat(orderItemGroup.attributes.EOrderItemsS);
            });
        }
        _.each(orderItems, function(orderItem) {
            // prepare gaItems
            var gaItem = {
                'id': txnData.attributes.orderEncId
                , 'name': orderItem.productName
                , 'sku': orderItem.productSKU
                , 'price': orderItem.originalItemPrice
                , 'quantity': orderItem.quantity
                , 'currency': txnData.attributes['orderData'].currencyISOCode
            }
            gaItems.push(gaItem);
        });
        _.each(gaItems, function(gaItem) {
            // merge duplicate gaItems, adding the quantity
            if (!this[gaItem.name]) {
                this[gaItem.name] = {
                    'id':gaItem.id
                    , 'name': gaItem.name
                    , 'sku':gaItem.sku
                    , 'quantity': 0
                    , 'price':gaItem.price
                    , 'currency': gaItem.currency };
                mergedGAItems.push(this[gaItem.name]);
            }
            this[gaItem.name].quantity += gaItem.quantity;
        }, Object.create(null));
        gaTxn.items = mergedGAItems;
        CCRZ.ga.sendEvent(context, gaTxn, hitCallback);
    };

    CCRZ.ga.sendException = function(context, exData, hitCallback) {
        console.log("[ga4] sendException");
        var gaEx = {
            'hitType': 'exception',
            'exDescription': 'Exception',
            'eventAction': 'Exception'
        };
        if (exData['exDescription']) { gaEx['exDescription'] = exData['exDescription']; }
        if (exData['exFatal']) { gaEx['exFatal'] = exData['exFatal']; }
        if (typeof hitCallback === 'function') { gaEx['hitCallback'] = hitCallback; }
        CCRZ.ga.sendEvent(context, gaEx, hitCallback);
    };

})(this.CCRZ, window);