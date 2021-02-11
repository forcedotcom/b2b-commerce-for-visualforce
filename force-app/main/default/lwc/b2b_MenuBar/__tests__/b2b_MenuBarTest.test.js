import { createElement } from 'lwc';
import b2b_MenuBar from 'c/b2b_MenuBar';
import { initContext, buildUrl, gotoURL } from 'c/b2b_CommonServices';
import getMenus from '@salesforce/apex/ccrz.b2b_lwc_MenuController.getMenus';
import getStorefront from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName';
import getUserInfo from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getUserInfo';

// Provision data through @wire
import {registerLdsTestWireAdapter} from '@salesforce/sfdx-lwc-jest';

// Register any wires associated to your component
const getMenusWireAdapter = registerLdsTestWireAdapter(getMenus);
const getStorefrontWireAdapter = registerLdsTestWireAdapter(getStorefront);
const getUserInfoWireAdapter = registerLdsTestWireAdapter(getUserInfo);

jest.mock('c/b2b_CommonServices', () => {
	return {
		initContext: jest.fn(),
		buildUrl: jest.fn(),
		gotoURL: jest.fn()
	};
}, {
	virtual: true
});

// Load in the JSON data
const mockMenuBarData = require('./data/b2b_MenuBar.json');

function flushPromises() {
	return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_MenuBar', () => {

	const TEST_URL = 'https://mock.url';

	afterEach(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild);
		}
		jest.resetAllMocks();
	});
	
	describe('b2b_MenuBar initMenus', () => {
		
		it('correctly loads menus ', () => {

			buildUrl.mockResolvedValue(TEST_URL);

			const element = createElement('c-b2b_MenuBar', {
				is: b2b_MenuBar
			});

			getMenusWireAdapter.emit(mockMenuBarData.data_3menus);

			document.body.appendChild(element);

			return flushPromises().then(() => {
			
				const navbarNav = element.shadowRoot.querySelector('.cc_navbar-nav');
				// We will should have home icon + three items we load + my account menu
				expect(navbarNav.childElementCount).toBe(5);
			});
		});
	});

	describe('b2b_MenuBar handleNavbarToggle', () => {
		
		it('correctly handles toggling mobile menu ', () => {
			
			buildUrl.mockResolvedValue(TEST_URL);

			const element = createElement('c-b2b_MenuBar', {
				is: b2b_MenuBar
			});

			getMenusWireAdapter.emit(mockMenuBarData.data_3menus);
			
			document.body.appendChild(element);
			
			const navbarButton = element.shadowRoot.querySelector('.cc_navbar_toggle');
			const navbar = element.shadowRoot.querySelector('.navbar-collapse');
			// initial values
			expect(navbarButton.classList.contains("collapsed")).toBe(true);
			expect(navbarButton.getAttribute("aria-expanded")).toBe('false');
			expect(navbar.classList.contains("in")).toBe(false);
			expect(navbar.getAttribute("aria-expanded")).toBe(null);
			expect(navbar.getAttribute("style")).toBe(null);
			// open menu
			navbarButton.click();
			expect(navbarButton.classList.contains("collapsed")).toBe(false);
			expect(navbarButton.getAttribute("aria-expanded")).toBe('true');
			expect(navbar.classList.contains("in")).toBe(true);
			expect(navbar.getAttribute("aria-expanded")).toBe('true');
			expect(navbar.getAttribute("style")).toBe('');
			// close menu
			navbarButton.click();
			expect(navbarButton.classList.contains("collapsed")).toBe(true);
			expect(navbarButton.getAttribute("aria-expanded")).toBe('false');
			expect(navbar.classList.contains("in")).toBe(false);
			expect(navbar.getAttribute("aria-expanded")).toBe('false');
			expect(navbar.getAttribute("style")).toBe('height: 1px;');
		});
	});
});