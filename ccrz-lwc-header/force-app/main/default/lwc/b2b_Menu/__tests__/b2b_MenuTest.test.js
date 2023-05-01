import { createElement } from 'lwc';
import b2b_Menu from 'c/b2b_Menu';
import { initContext, mergePageLabelData, buildProductDetailsPageUrl, buildProductListPageUrl, buildUrl, gotoProductListPage, gotoProductDetailsPage, gotoURL } from 'c/b2b_CommonServices';
import getUserInfo from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getUserInfo';

// Provision data through @wire
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';

// Register any wires associated to your component
const getUserInfoWireAdapter = registerLdsTestWireAdapter(getUserInfo);

jest.mock('c/b2b_CommonServices', () => {
	return {
		initContext: jest.fn(),
		mergePageLabelData: jest.fn(),
		buildProductDetailsPageUrl: jest.fn(),
		buildProductListPageUrl: jest.fn(),
		buildUrl: jest.fn(),
		gotoProductListPage: jest.fn(),
		gotoProductDetailsPage: jest.fn(),
		gotoURL: jest.fn()
	};
}, {
	virtual: true
});

const mockMenuData = require('./data/b2b_Menu.json');

function flushPromises() {
	return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_Menu', () => {
	
	afterEach(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild);
		}
		jest.resetAllMocks();
	});
	
	describe('b2b_Menu toggleMenu', () => {
		
		it('correctly toggles dropdown menu', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_dropdownMenu;
			document.body.appendChild(element);
			
			const dropdownSubmenu = element.shadowRoot.querySelector('.dropdown');
			const dropdownSubmenuLink = element.shadowRoot.querySelector('.dropdown-toggle');
			
			dropdownSubmenuLink.click();
			expect(dropdownSubmenu.childElementCount).toBe(2);
			expect(dropdownSubmenu.textContent).toBe(mockMenuData.data_dropdownMenu['displayName']);
			expect(dropdownSubmenu.classList.contains("open")).toBe(true);
			
			dropdownSubmenuLink.click();
			expect(dropdownSubmenu.classList.contains("open")).toBe(false);
		});
	});
	
	describe('b2b_Menu handleMenuClick', () => {

		it('navigates to the correct internal url', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_link_InternalURL;
			buildUrl.mockResolvedValue(mockMenuData.data_link_InternalURL['linkURL']);
			document.body.appendChild(element);
			
			const menuLink = element.shadowRoot.querySelector('a');
			expect(menuLink.textContent).toBe(mockMenuData.data_link_InternalURL['displayName']);
			
			menuLink.click();
			expect(gotoProductListPage).toHaveBeenCalledTimes(0);
			expect(gotoProductDetailsPage).toHaveBeenCalledTimes(0);
			expect(gotoURL).toHaveBeenCalledTimes(1);
			expect(gotoURL).toHaveBeenCalledWith({
				"newWindow": mockMenuData.data_link_InternalURL['openInNewWindow'],
				"url": mockMenuData.data_link_InternalURL['linkURL']
			});
		});

		it('navigates to the correct external url', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_link_ExternalURL;
			buildUrl.mockResolvedValue(mockMenuData.data_link_ExternalURL['linkURL']);
			document.body.appendChild(element);
			
			const menuLink = element.shadowRoot.querySelector('a');
			expect(menuLink.textContent).toBe(mockMenuData.data_link_ExternalURL['displayName']);
			
			menuLink.click();
			expect(gotoProductListPage).toHaveBeenCalledTimes(0);
			expect(gotoProductDetailsPage).toHaveBeenCalledTimes(0);
			expect(gotoURL).toHaveBeenCalledTimes(1);
			expect(gotoURL).toHaveBeenCalledWith({
				"newWindow": mockMenuData.data_link_ExternalURL['openInNewWindow'],
				"url": mockMenuData.data_link_ExternalURL['linkURL']
			});
		});
		
		it('navigates to the correct category', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_link_Category;
			buildProductListPageUrl.mockResolvedValue(mockMenuData.data_link_Category['mockDetermineLinkUrl']);
			element.configValues.useProductListPageV2 = true;
			document.body.appendChild(element);
			
			const menuLink = element.shadowRoot.querySelector('a');
			expect(menuLink.textContent).toBe(mockMenuData.data_link_Category['displayName']);
			
			menuLink.click();
			expect(gotoProductListPage).toHaveBeenCalledTimes(1);
			expect(gotoProductDetailsPage).toHaveBeenCalledTimes(0);
			expect(gotoURL).toHaveBeenCalledTimes(0);
			expect(gotoProductListPage).toHaveBeenCalledWith({
				"newWindow": mockMenuData.data_link_Category['openInNewWindow'],
				"categoryId": mockMenuData.data_link_Category['linkURL'],
				"useProductListPageV2": true,
				"friendlyUrl": mockMenuData.data_link_Category['friendlyUrl']
			});
		});
		
		it('navigates to the correct product', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_link_Product;
			buildProductDetailsPageUrl.mockResolvedValue(mockMenuData.data_link_Product['mockDetermineLinkUrl']);
			document.body.appendChild(element);
			
			const menuLink = element.shadowRoot.querySelector('a');
			expect(menuLink.textContent).toBe(mockMenuData.data_link_Product['displayName']);
			
			menuLink.click();
			expect(gotoProductListPage).toHaveBeenCalledTimes(0);
			expect(gotoProductDetailsPage).toHaveBeenCalledTimes(1);
			expect(gotoURL).toHaveBeenCalledTimes(0);
			expect(gotoProductDetailsPage).toHaveBeenCalledWith({
				"newWindow": mockMenuData.data_link_Product['openInNewWindow'],
				"sku": mockMenuData.data_link_Product['linkURL'],
				"friendlyUrl": mockMenuData.data_link_Product['friendlyUrl']
			});
		});
	});

	describe('b2b_Menu DOM updated correctly ', () => {
		
		it('URL link has correct url and classList', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_link_InternalURL;
			buildUrl.mockResolvedValue(mockMenuData.data_link_InternalURL['linkURL']);
			document.body.appendChild(element);
			
			expect(element.menu.mType).toBe(mockMenuData.data_link_InternalURL['mType']);
			const menuLink = element.shadowRoot.querySelector('a');
			expect(menuLink.textContent).toBe(mockMenuData.data_link_InternalURL['displayName']);
		});
		
		it('Category link has DOM updated correctly', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_link_Category;
			buildProductListPageUrl.mockResolvedValue(mockMenuData.data_link_Category['mockDetermineLinkUrl']);
			document.body.appendChild(element);

			return flushPromises().then(() => {
				const menuLink = element.shadowRoot.querySelector('a');
				expect(menuLink.classList.contains('cc_category')).toBe(true);
				expect(menuLink.classList.contains('gp_cat')).toBe(true);
				expect(menuLink.getAttribute('href')).toBe(mockMenuData.data_link_Category['mockDetermineLinkUrl']);
			});
		});
		
		it('Product link has DOM updated correctly', () => {
			
			const element = createElement('c-b2b_Menu', {
				is: b2b_Menu
			});
			
			element.menu = mockMenuData.data_link_Product;
			buildProductDetailsPageUrl.mockResolvedValue(mockMenuData.data_link_Product['mockDetermineLinkUrl']);
			document.body.appendChild(element);
			
			const menuLink = element.shadowRoot.querySelector('a');
			
			return flushPromises().then(() => {
				expect(menuLink.classList.contains('cc_product')).toBe(true);
				expect(menuLink.classList.contains('gp_prod')).toBe(true);
				expect(menuLink.getAttribute('href')).toBe(mockMenuData.data_link_Product['mockDetermineLinkUrl']);
			});
		});
	});
});
