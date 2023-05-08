import { createElement } from 'lwc';
import B2b_LanguageSelectorModal from 'c/b2b_LanguageSelectorModal';
const mockLangSelectorData = require('./data/b2b_LanguageSelectorModal.json');

function flushPromises() {
	return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_-language-selector-modal', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Verifies modal window. No LOC labels', () => {
        const element = createElement('c-b2b_-language-selector-modal', {
            is: B2b_LanguageSelectorModal
        });

        element.localesData = mockLangSelectorData.localesData;
        element.pageLabelValues = mockLangSelectorData.pageLabelValuesNoLOC;
        document.body.appendChild(element);

        return flushPromises().then(() => {
            const modalContainer = element.shadowRoot.querySelectorAll('.slds-modal__container');
            expect(modalContainer.length).toBe(1);

            const langAvailable = element.shadowRoot.querySelectorAll('.cc_tr_locale');
            expect(langAvailable.length).toBe(6);

            let en_display, jp_display, es_display, fr_display, it_display, de_display = false //, enLocale, jpLocale = false;

            langAvailable.forEach(lang => {
                switch(lang.textContent) {
                    case 'en_US': en_display = true; break;
                    case 'ja_JP': jp_display = true; break;
                    case 'es_ES': es_display = true; break;
                    case 'fr_FR': fr_display = true; break;
                    case 'it_IT': it_display = true; break;
                    case 'de_DE': de_display = true; break;
                    default: break;
                }
            });

            expect(en_display).toBe(true);
            expect(jp_display).toBe(true);
            expect(es_display).toBe(true);
            expect(fr_display).toBe(true);
            expect(it_display).toBe(true);
            expect(de_display).toBe(true);

        })


    });

    it('Verifies LOC page label works ok', () => {
        const element = createElement('c-b2b_-language-selector-modal', {
            is: B2b_LanguageSelectorModal
        });

        element.localesData = mockLangSelectorData.localesData;
        element.pageLabelValues = mockLangSelectorData.pageLabelValues;
        document.body.appendChild(element);

        return flushPromises().then(() => {

            const langAvailable = element.shadowRoot.querySelectorAll('.cc_tr_locale');
            let LOC_en_display, LOC_fr_display = false;

            langAvailable.forEach(lang => {
                if (lang.textContent === 'English') { LOC_en_display = true; }
                else if (lang.textContent === 'Francais') { LOC_fr_display = true; }
            });

            expect(LOC_en_display).toBe(true);
            expect(LOC_fr_display).toBe(true);
        })


    });

    it('Verifies page labels display correctly', () => {
        const element = createElement('c-b2b_-language-selector-modal', {
            is: B2b_LanguageSelectorModal
        });

        element.localesData = mockLangSelectorData.localesData;
        element.pageLabelValues = mockLangSelectorData.pageLabelValues;
        document.body.appendChild(element);

        return flushPromises().then(() => {

            const closeModalBtn = element.shadowRoot.querySelector('.cc_close_modal');
            const setLocaleBtn = element.shadowRoot.querySelector('.cc_set_locale');
            const modalTitle = element.shadowRoot.querySelector('.cc_modal_title');
            const modalLabel = element.shadowRoot.querySelector('.cc_modal_body p');

            expect(closeModalBtn.value).toBe("Cancel");
            expect(setLocaleBtn.value).toBe("Select");
            expect(modalTitle.textContent).toBe("Select a Locale");
            expect(modalLabel.textContent).toBe("Select a locale to reload the page in your preferred language.");
        })
    });
});