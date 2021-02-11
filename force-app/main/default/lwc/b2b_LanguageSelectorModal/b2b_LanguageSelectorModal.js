/**
 * Created by salesforce.com, inc.
 * Copyright 2020 salesforce.com, inc. All rights reserved.
 * Redistribution and use in source or binary forms, with or without
 * modification is PROHIBITED.
 */
import {api, LightningElement, wire} from 'lwc';
import {initContext, ccLogs, gotoURL, mergePageLabelData} from 'c/b2b_CommonServices';
import setCurrentLanguage from "@salesforce/apex/ccrz.b2b_lwc_LanguageController.setCurrentLanguage";

export default class b2b_LanguageSelectorModal extends LightningElement {

    @api pageLabelValues = {};
    @api localesData = {};
    @api isModalOpen = false;
    selectedLanguage;

    selectLanguage(event) {
        this.selectedLanguage = event.currentTarget.getAttribute('data-id');
        let langClassActive = event.currentTarget.getAttribute('class') + ' active';
        let parent = event.currentTarget.parentElement;

        parent.childNodes.forEach(child => child.setAttribute('class', 'cc_tr_locale'));

        // Set the selected language class to active
        event.currentTarget.setAttribute('class', langClassActive);
    }

    // Saves the selected language and refreshes the page to display based on said selected language
    setLanguage(event) {
        if(!this.selectedLanguage || this.selectedLanguage === this.currentLanguage) { return; }
        setCurrentLanguage({
            inputData: initContext({
                selectedLanguage: this.selectedLanguage
            })
        }).then(result => {
            if(result && result.success && result.languageData) {
                ccLogs(result.log);
                this.selectedLanguage = result.languageData.locale;
                const forwardUrl = new URL(document.location);
                let urlParams = forwardUrl.searchParams;
                urlParams.set('language', this.selectedLanguage);

                gotoURL({
                    url: forwardUrl.href
                });
            } else if(result && !result.success) {
                ccLogs(result.log);
                console.error('b2b_LanguageSelector.setLanguage: setCurrentLanguage success was false');
            }
        }).catch(error => {
            console.error('b2b_LanguageSelector.setLanguage: setCurrentLanguage error loading Language data', error);
        });
    }

    // Processes language locales, including their page labels
    get languageLocales() {
        let languageLocales = [];

        if (this.localesData) {
            // If there's a page label for the local (Prefix 'LOC_'), grab the value, else display the locale
            this.localesData.forEach(locale => {
                let localeObj = {
                    id: locale,
                    displayVal: this.pageLabelValues && this.pageLabelValues.localeValues['LOC_' + locale] ?
                        mergePageLabelData(this.pageLabelValues.localeValues['LOC_' + locale], [locale]) : locale
                };
                languageLocales.push(localeObj);
            });
        } else if (languageListData && !languageListData.success) {
            console.error("[b2blwc]: Could not retrieve locales data. Success was false.");
        }

        return languageLocales;
    }

    // Event handler to close the modal (event listener is defined in b2b_LanguageSelector)
    toggleLangSelectModalHandler(event) {
        event.preventDefault();
        const toggleEvt = new CustomEvent('toggleLangSelectModalEvt', { bubbles: true });
        this.dispatchEvent(toggleEvt);
    }
}