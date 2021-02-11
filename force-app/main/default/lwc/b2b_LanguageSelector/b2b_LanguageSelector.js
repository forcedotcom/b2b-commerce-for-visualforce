/**
 * Created by salesforce.com, inc.
 * Copyright 2020 salesforce.com, inc. All rights reserved.
 * Redistribution and use in source or binary forms, with or without
 * modification is PROHIBITED.
 */
import {LightningElement, api, wire} from 'lwc';
import { initContext, mergePageLabelData} from 'c/b2b_CommonServices';
import getAvailableLanguages from '@salesforce/apex/ccrz.b2b_lwc_LanguageController.getAvailableLanguages';

export default class b2b_LanguageSelector extends LightningElement {

    isModalOpen = false;
    @api pageLabelValues = {};
    @wire(getAvailableLanguages,{inputData : initContext({})}) languageSelectorLocaleData;

    constructor() {
        super();
        // Registering the modal toggle event
        this.template.addEventListener('toggleLangSelectModalEvt', this.toggleLangSelectModalHandler.bind(this));
    }

    toggleLangSelectModalHandler(event) {
        this.toggleLangSelectModal();
    }

    get currentLanguage() {
        let currLang = '';
        if(this.languageSelectorLocaleData.data && this.languageSelectorLocaleData.data.languageData.locale) {
            const loc = this.languageSelectorLocaleData.data.languageData.locale;
            const pageLabelLocale = this.pageLabelValues.localeValues['LOC_' + loc] ?
                mergePageLabelData(this.pageLabelValues.localeValues['LOC_' + loc], [loc]) : loc;
            currLang = pageLabelLocale;
        }

        return currLang;
    }

    get localesData() {
        let locData = {};
        if(this.languageSelectorLocaleData.data && this.languageSelectorLocaleData.data.languageData.availableLocales) {
            locData = this.languageSelectorLocaleData.data.languageData.availableLocales;
        }

        return locData;
    }

    toggleLangSelectModal() {
        this.isModalOpen = !this.isModalOpen;
    }
}