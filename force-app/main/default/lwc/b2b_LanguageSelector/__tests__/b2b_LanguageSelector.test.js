import { createElement } from 'lwc';
import B2b_LanguageSelector from 'c/b2b_LanguageSelector';
import getAvailableLanguages from '@salesforce/apex/ccrz.b2b_lwc_LanguageController.getAvailableLanguages';

// Provision data through @wire
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';

// Register any wires associated to your component
const getAvailableLanguagesAdapter = registerLdsTestWireAdapter(getAvailableLanguages);

// Load in the JSON data
const mockLangSelectorData = require('./data/b2b_LanguageSelector.json');
const pageLabelsData = require('./data/b2b_LanguageSelectorPageLabelValues.json');

function flushPromises() {
	return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_-language-selector', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Verifies locale switcher link is present', () => {
        const element = createElement('c-b2b_-language-selector', {
            is: B2b_LanguageSelector
        });

        element.pageLabelValues = pageLabelsData.pageLabelValues;
        document.body.appendChild(element);
        getAvailableLanguagesAdapter.emit(mockLangSelectorData);

        return flushPromises().then(() => {
            const localeLabelEl = element.shadowRoot.querySelector('.cc_locale_label');
            const currentLocaleEl = element.shadowRoot.querySelector('.cc_current_locale');
            expect(localeLabelEl.textContent).toBe("Locale");
            expect(currentLocaleEl.textContent).toBe("English");
        });
    });
});