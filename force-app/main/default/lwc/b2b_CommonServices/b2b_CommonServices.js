/**
 * Created by salesforce.com, inc.
 * Copyright 2020 salesforce.com, inc. All rights reserved.
 * Redistribution and use in source or binary forms, with or without
 * modification is PROHIBITED.
 */
import LANG from '@salesforce/i18n/lang';
import getStorefrontName from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName';
import getSFUrl from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontUrl';
import getNamespace from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getNamespace';
import getPageLabelData from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getPageLabelData';
import getConfigData from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getConfigData';
const VERSION = 12;

let allParams = {};

/**
 * Used to initialize the context and is used to provide the necessary parameters to
 * an Apex method so that it can retrieve specific data for a given call.
 */
const initContext = (obj) => {
    let b2bContextQueryParams = {};
    let urlParams = (new URL(document.location)).searchParams;

    if (null != obj && "object" === typeof obj) {
        allParams = obj.constructor();

        // Prepend b2b_context params (url params) to params being passed in:
        urlParams.forEach(function(value, key) {
            b2bContextQueryParams[key.toLocaleLowerCase()] = value;
        });

        // Add the query param list found from the url to the key: b2bContext
        allParams.b2bContext = { "queryParams": b2bContextQueryParams };

        allParams.b2bContext.cookies = {};
        allParams.b2bContext.cookies.currCartId = getCookie("currCartId");
        allParams.b2bContext.cookies.effacc = getCookie("effacc");

        // Map any query params within the URL to its corresponding b2bContext/cc_CallContext values.
        if (b2bContextQueryParams.hasOwnProperty('store')) {
            allParams.b2bContext.store = b2bContextQueryParams.store;
        }
        if (b2bContextQueryParams.hasOwnProperty('cartid')) {
            allParams.b2bContext.currCartId = b2bContextQueryParams.cartid;
        }
        if (b2bContextQueryParams.hasOwnProperty('portaluser')) {
            allParams.b2bContext.portalUser = b2bContextQueryParams.portaluser;
        }
        if (b2bContextQueryParams.hasOwnProperty('effectiveaccount')) {
            allParams.b2bContext.effAccountId = b2bContextQueryParams.effectiveaccount;
        } else if(allParams.b2bContext.cookies.effacc) {
            allParams.b2bContext.effAccountId = allParams.b2bContext.cookies.effacc;
        }
        if (b2bContextQueryParams.hasOwnProperty('grid')) {
            allParams.b2bContext.priceGroupId = b2bContextQueryParams.grid;
        }
        if (b2bContextQueryParams.hasOwnProperty('language')) {
            allParams.b2bContext.userLocale = b2bContextQueryParams.language;
        }

        // Add the version to our parameters list.
        allParams.version = VERSION;

        // The list that holds the necessary parameters used for b2bContext/cc_CallContext.
        // This is used to check to see if a b2bContext param is passed in so that it is set correctly in cc_CallContext.
        const b2bContextList = ['store', 'currCartId', 'portalUser', 'effAccountId'];

        // Add any other unique param being passed into this function outside the URL parameters.
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                // If we are passing in a key b2bContext parameter add it to the b2bContext key instead.
                if (b2bContextList.includes(attr)) {
                    allParams.b2bContext[attr] = obj[attr];
                } else {
                    allParams[attr] = obj[attr];
                }
            }
        }
    }
    return allParams;
};

const getNamespaceBar = async() => {
    let namespace = await getNamespace();
    return (namespace ? namespace + '__' : namespace);
};

const getStoreName = () => {
    return getStorefrontName();
};

const getStorefrontUrl = () => {
    return getSFUrl();
};

const getLanguage = () => {
    return LANG.replace(/-/g, '_');
};

const getCookie = (cookieName) => {
    if (document.cookie.length > 0) {
        let valueStart = document.cookie.indexOf(cookieName + "=");
        if (valueStart !== -1) {
            valueStart = valueStart + cookieName.length + 1;
            let valueEnd = document.cookie.indexOf(";", valueStart);
            if (valueEnd === -1) {
                valueEnd = document.cookie.length;
            }
            return window.unescape(document.cookie.substring(valueStart, valueEnd));
        }
    }
    return "";
};

const setCookieWithPath = (c_name, value, expiredays, path) => {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + window.escape(value) + ";secure;samesite=strict;" + ((expiredays === null) ? "" : ";expires=" + exdate.toGMTString())+";path="+path;
    console.log('setCookieWithPath: ' + document.cookie);
};

const getConfigValues = () => getConfigData({
    inputData: initContext({})
}).then(result => {
    if (result && result.success && result.configData) {
        ccLogs(result.log);
        return JSON.parse(result.configData);
    } else if (result && !result.success) {
        ccLogs(result.log);
        console.warn('[b2blwc.getConfigurationValues]: success was false');
    }
}).catch(error => {
    console.error('[b2blwc.getConfigurationValues]: error loading config data ' + error);
});

const getPageLabelValues = () => getPageLabelData({
    inputData: initContext({})
}).then(result => {
    if (result && result.success && result.pageLabels) {
        ccLogs(result.log);
        return JSON.parse(result.pageLabels);
    } else if (result && !result.success) {
        ccLogs(result.log);
        console.warn('[b2blwc.getPageLabelValues]: success was false');
    }
}).catch(error => {
    console.error('[b2b_CommonServices.getPageLabelValues]: ' + error);
});

const mergePageLabelData = (pageLabel, mergeData) => {
    for (let i = 0; i < mergeData.length; i++) {
        const pattern = "\\{" + i + "\\}";
        const re = new RegExp(pattern, "g");
        pageLabel = pageLabel.replace(re, mergeData[i]);
    }
    return (pageLabel);
};

const formatPrice = (locale, currency, amount) => {
    const adjustedLocale = locale.replace(/_/g, '-');
    const numberFormat = new Intl.NumberFormat(adjustedLocale, {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol'
    });
    return numberFormat.format(amount);
};

/**
 * A similar look and feel to how we see ccLogs in the console for the VF side.
 */
const ccLogs = (ccLogs) => {
    if (typeof ccLogs !== 'undefined') {
        for (let i = 0, length = ccLogs.length; i < length; i++) {
            let obj = ccLogs[i];
            let logString = '[r]';

            if (obj.ts) {
                logString += '[' + obj.ts + ']'
            }
            if (obj.lvl) {
                logString += '[' + obj.lvl + ']'
            }
            if (obj.sub) {
                logString += '[' + obj.sub + ']'
            }
            if (obj.val) {
                logString += '[' + JSON.stringify(obj.val) + ']'
            }
            console.info(logString);
        }
    }
};

/****** Below this Line are services related to general URL building/navigating ******/

/**
 * Builds the url params based on the params captured in the initContext fn
 */
const buildLwcQueryString = (url) => {
    let queryString = url;
    let paramsUrl = url.indexOf('?') === -1 ? "" : url.substring(url.indexOf('?') + 1).toLowerCase();
    if (paramsUrl.indexOf("cartid") === -1 && allParams.b2bContext.currCartId) {
        (queryString && queryString.includes('?')) ? queryString += '&': queryString += '?';
        queryString += 'cartId=' + allParams.b2bContext.currCartId;
    }
    if (paramsUrl.indexOf("portaluser") === -1 && allParams.b2bContext.portalUser) {
        (queryString && queryString.includes('?')) ? queryString += '&': queryString += '?';
        queryString += 'portalUser=' + allParams.b2bContext.portalUser;
    }
    if (paramsUrl.indexOf("store") === -1 && allParams.b2bContext.store) {
        (queryString && queryString.includes('?')) ? queryString += '&': queryString += '?';
        queryString += 'store=' + allParams.b2bContext.store;
    }
    if (paramsUrl.indexOf("effectiveaccount") === -1 && allParams.b2bContext.effAccountId) {
        (queryString && queryString.includes('?')) ? queryString += '&': queryString += '?';
        queryString += 'effectiveAccount=' + allParams.b2bContext.effAccountId;
    }
    if (paramsUrl.indexOf("grid") === -1 && allParams.b2bContext.priceGroupId) {
        (queryString && queryString.includes('?')) ? queryString += '&': queryString += '?';
        queryString += 'grid=' + allParams.b2bContext.priceGroupId;
    }
    return queryString;
};

/**
 * Builds the URL based on the inputData being passed in
 * and ensures the proper language parameter (Community vs VF vs external) is set
 */
const buildUrl = (inputData) => {
    let url = inputData.url;

    return new Promise((resolve, reject) => {
        getStoreName().then(result => {
            const storefrontName = result;

            if (url && url.indexOf(storefrontName) > -1) {
                if (url.indexOf(storefrontName + '/s/') > -1 && url.indexOf('language=') === -1) {
                    // add language if missing and navigating to a community page
                    url += (url.indexOf('?') > -1) ? '&' : '?';
                    url += 'language=' + getLanguage();
                } else if (url.indexOf(storefrontName) > -1 && url.indexOf('/s/') === -1 && url.indexOf('cclcl=') === -1) {
                    // add cclcl if missing and navigating to a vf page
                    url += (url.indexOf('?') > -1) ? '&' : '?';
                    url += 'cclcl=' + getLanguage();
                }
                resolve(url);
            } else if (url && url === 'HOME') {
                url = '/' + storefrontName;
                getConfigValues().then(result => {
                    if (result) {
                        const hptype = result['hp.type'];
                        switch (hptype) {
                            case 'external':
                                if (result['hp.exturl']) {
                                    url = result['hp.exturl'];
                                }
                                url += (url.indexOf('?') > -1) ? '&' : '?';
                                url += 'cclcl=' + getLanguage();
                                break;

                            case 'community':
                                url += '/s/?language=' + getLanguage();
                                break;

                            default:
                                url += '?cclcl=' + getLanguage();
                        }
                        resolve(url);
                    }
                }).catch(error => {
                    console.error('b2b_CommonServices.buildUrl: error in getConfigValues', error);
                });
            }
        }).catch(error => {
            reject(error);
        });
    });
};

/**
 * Builds a url to a vf page
 * includes the storefront domain, context, and namespace
 * adds the cclcl param
 */
const buildPageUrl = (inputData) => {
    const page = inputData.page;
    const friendlyUrl = inputData.friendlyUrl;
    const urlParams = inputData.urlParams;

    return new Promise((resolve, reject) => {
        getStorefrontUrl().then(result => {
            let pageUrl = result;

            if (friendlyUrl) {
                pageUrl += friendlyUrl + '?cclcl=' + getLanguage();
                resolve(pageUrl);
            } else {
                getNamespaceBar().then(result => {
                    // if '' is returned, then the type is not a string but an object. Handle that case here.
                    if (typeof result !== 'string') {
                        result = '';
                    }

                    if (urlParams) {
                        pageUrl += '/' + result + page + '?' + urlParams + '&cclcl=' + getLanguage();
                    } else {
                        pageUrl += '/' + result + page + '?cclcl=' + getLanguage();
                    }

                    resolve(pageUrl);
                }).catch(error => {
                    reject(error);
                });
            }
        }).catch(error => {
            reject(error);
        });
    });
};

/**
 * Navigates to a url based on the provided inputData
 */
const gotoURL = (inputData) => {
    const newWindow = inputData.newWindow;

    buildUrl(inputData).then(result => {
        const url = buildLwcQueryString(result);
        if (newWindow) {
            window.open(url);
        } else {
            window.location.assign(url);
        }
    }).catch(error => {
        console.error('Error in gotoURL:', error);
    });
};

/**
 * Navigates to a VF Page based on the provided inputData
 */
const gotoPage = (inputData) => {
    buildPageUrl(inputData).then(result => {
        gotoURL({
            url: result,
            newWindow: inputData.newWindow
        });
    }).catch(error => {
        console.warn(error);
    });
};

/****** Below this Line are services related to Product URL building/navigating ******/

/**
 * Builds URL to VF Product List Page,
 * then navigates to Product List URL
 */
const buildProductListPageUrl = (inputData) => {
    const searchString = inputData.searchString;
    const categoryId = inputData.categoryId;
    const friendlyUrl = inputData.friendlyUrl;
    const useProductListPageV2 = inputData.useProductListPageV2.toLowerCase();

    const page = (useProductListPageV2 === 'true') ? 'ProductList' : 'Products';
    const params = searchString ? 'operation=quickSearch&searchText=' + searchString : 'categoryId=' + categoryId;

    return buildPageUrl({
        friendlyUrl: friendlyUrl,
        page: page,
        urlParams: params
    });
};

/**
 * Builds a URL to a VF Product Details Page
 * Used to populate href for links for SEO conformance
 * Used by gotoProductDetailsPage
 */
const buildProductDetailsPageUrl = (inputData) => {
    const sku = inputData.sku;
    const friendlyUrl = inputData.friendlyUrl;

    return buildPageUrl({
        friendlyUrl: friendlyUrl,
        page: 'ProductDetails',
        urlParams: 'sku=' + sku
    });
};

/**
 * Builds URL to VF Product Details Page,
 * then navigates to Product Details URL
 */
const gotoProductDetailsPage = (inputData) => {
    buildProductDetailsPageUrl(inputData).then(result => {
        gotoURL({
            url: result,
            newWindow: inputData.newWindow
        });
    }).catch(error => {
        console.warn(error);
    });
};

/**
 * Builds URL to VF Product List Page,
 * then navigates to Product List URL
 */
const gotoProductListPage = (inputData) => {
    buildProductListPageUrl(inputData).then(result => {
        gotoURL({
            url: result,
            newWindow: inputData.newWindow
        });
    }).catch(error => {
        console.warn(error);
    });
};

/**
 * Navigates to VF Cart Page
 * Adds cartId param if encrypted cart Id is provided
 */
const gotoCartPage = (inputData) => {
    gotoPage({
        page: 'Cart',
        urlParams: inputData.encryptedId ? 'cartId=' + inputData.encryptedId : '',
        newWindow: inputData.newWindow
    });
};

export {
    initContext,
    ccLogs,
    getPageLabelValues,
    getConfigValues,
    getLanguage,
    buildUrl,
    buildPageUrl,
    buildProductDetailsPageUrl,
    buildProductListPageUrl,
    gotoProductDetailsPage,
    gotoProductListPage,
    gotoCartPage,
    gotoPage,
    gotoURL,
    mergePageLabelData,
    formatPrice,
    setCookieWithPath
};