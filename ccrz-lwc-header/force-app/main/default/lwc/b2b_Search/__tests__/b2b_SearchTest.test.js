import {createElement} from 'lwc';
import b2b_Search from 'c/b2b_Search';

import getAutocompleteResults from '@salesforce/apex/ccrz.b2b_lwc_SearchController.getAutocompleteResults';

const mockAutocompleteData = require('./data/b2b_Search.json');
const mockAutocompleteDataNoData = {};

// Mocking imperative Apex method call
jest.mock('@salesforce/apex/ccrz.b2b_lwc_SearchController.getAutocompleteResults',() => 
	{return {default: jest.fn()};},
	{ virtual: true }
);

describe('c-b2b_Search', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild);
		}
		jest.clearAllMocks();
	});

	describe('b2b_Search handleSearchOnInputChange', () => {

		function flushPromises() {
			return new Promise((resolve) => setImmediate(resolve));
		}

		it('properly handles autocomplete results', () => {
			getAutocompleteResults.mockResolvedValue(mockAutocompleteData);
			
			const element = createElement('c-b2b-Search', {
				is: b2b_Search
			});

			document.body.appendChild(element);

			expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(0);

			const searchInput = element.shadowRoot.querySelector('.cc_search_input');
			searchInput.value = 'Cap';
			searchInput.dispatchEvent(new Event('input'));

			flushPromises().then(() => {
				expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(3);
			});
		});

		it('properly handles autocomplete limits', () => {
			getAutocompleteResults.mockResolvedValue(mockAutocompleteData);
			
			const element = createElement('c-b2b-Search', {
				is: b2b_Search
			});

			document.body.appendChild(element);

			expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(0);

			const searchInput = element.shadowRoot.querySelector('.cc_search_input');
			searchInput.value = 'Ca'; // Two Characters Should Not Return Any Values
			searchInput.dispatchEvent(new Event('input'));

			flushPromises().then(() => {
				// Two Characters Should Not Return Any Values
				expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(0);
			});
		});

		it('properly handles autocomplete results after pressing Escape key', () => {
			getAutocompleteResults.mockResolvedValue(mockAutocompleteData);
			
			const element = createElement('c-b2b-Search', {
				is: b2b_Search
			});

			document.body.appendChild(element);

			expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(0);

			const searchInput = element.shadowRoot.querySelector('.cc_search_input');
			searchInput.value = 'Cap';
			searchInput.dispatchEvent(new Event('input'));

			flushPromises().then(() => {
				// Escape Should Flush Auto Complete Values
				expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(3);
			});

			flushPromises().then(() => {
				// Escape Should Flush Auto Complete Values
				searchInput.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}));
			});

			flushPromises().then(() => {
				// Escape Should Flush Auto Complete Values
				expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(0);
			});
		});

		it('properly handles no data returned', () => {
			getAutocompleteResults.mockResolvedValue(mockAutocompleteDataNoData);
			
			const element = createElement('c-b2b-Search', {
				is: b2b_Search
			});

			document.body.appendChild(element);

			expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(0);

			const searchInput = element.shadowRoot.querySelector('.cc_search_input');
			searchInput.value = 'Cap';
			searchInput.dispatchEvent(new Event('input'));

			flushPromises().then(() => {
				// Escape Should Flush Auto Complete Values
				expect(element.shadowRoot.querySelectorAll('.ui-menu-item-wrapper').length).toBe(0);
			});
		});
	});
});
