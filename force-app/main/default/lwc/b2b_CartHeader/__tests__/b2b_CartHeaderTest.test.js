import {createElement} from 'lwc';
import b2b_CartHeader from 'c/b2b_CartHeader';

import getCartHeader from '@salesforce/apex/ccrz.b2b_lwc_CartHeaderController.getCartHeader';
import {initContext,gotoCartPage,formatPrice} from 'c/b2b_CommonServices';

// Provision data through @wire
import {registerLdsTestWireAdapter} from '@salesforce/sfdx-lwc-jest';

// Load in the JSON data
const mockCartHeaderData = require('./data/b2b_CartHeader.json');

// Register any wires associated to your component
const getCartHeaderWireAdapter = registerLdsTestWireAdapter(getCartHeader);

jest.mock('c/b2b_CommonServices', () => {
	return {
		initContext: jest.fn(),
		gotoCartPage: jest.fn(),
		formatPrice: jest.fn()
	};
},{
	virtual: true
});

function flushPromises() {
	return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_CartHeader', () => {

	afterEach(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild);
		}
		jest.resetAllMocks();
	});

	describe('b2b_CartHeader getCartHeaderData', () => {

		it('correctly calls formatPrice when Cart Header loads', () => {

			const element = createElement('c-b2b_CartHeader', {
				is: b2b_CartHeader
			});

			element.pageLabelValues.MyCart = mockCartHeaderData.data_getPageLabelValues['Component_SiteHeader_MyCart'];
			element.pageLabelValues.Item = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Item'];
			element.pageLabelValues.Items = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Items'];
			
			getCartHeaderWireAdapter.emit(mockCartHeaderData.data_getCartHeader_2Items);
			formatPrice.mockReturnValue(mockCartHeaderData.data_getCartHeader_2Items.formattedPrice);
			
			document.body.appendChild(element);

			return flushPromises().then(() => {
				expect(formatPrice).toHaveBeenCalledTimes(1);
				expect(formatPrice).toHaveBeenCalledWith(
					mockCartHeaderData.data_getCartHeader_2Items.ccCallContext.userLocale,
					mockCartHeaderData.data_getCartHeader_2Items.ccCallContext.userIsoCode,
					mockCartHeaderData.data_getCartHeader_2Items.cartTotal
				);
			});
		});

		it('correctly calls formatPrice for JPY', () => {

			const element = createElement('c-b2b_CartHeader', {
				is: b2b_CartHeader
			});

			element.pageLabelValues.MyCart = mockCartHeaderData.data_getPageLabelValues['Component_SiteHeader_MyCart'];
			element.pageLabelValues.Item = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Item'];
			element.pageLabelValues.Items = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Items'];

			getCartHeaderWireAdapter.emit(mockCartHeaderData.data_getCartHeader_JPY);
			formatPrice.mockReturnValue(mockCartHeaderData.data_getCartHeader_JPY.formattedPrice);

			document.body.appendChild(element);

			return flushPromises().then(() => {
				expect(formatPrice).toHaveBeenCalledTimes(1);
				expect(formatPrice).toHaveBeenCalledWith(
					mockCartHeaderData.data_getCartHeader_JPY.ccCallContext.userLocale,
					mockCartHeaderData.data_getCartHeader_JPY.ccCallContext.userIsoCode,
					mockCartHeaderData.data_getCartHeader_JPY.cartTotal
				);
			});
		});

		it('displays correctly with 0 cart items', () => {

			const element = createElement('c-b2b_CartHeader', {
				is: b2b_CartHeader
			});
			element.pageLabelValues.MyCart = mockCartHeaderData.data_getPageLabelValues['Component_SiteHeader_MyCart'];
			element.pageLabelValues.Item = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Item'];
			element.pageLabelValues.Items = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Items'];

			getCartHeaderWireAdapter.emit(mockCartHeaderData.data_getCartHeader_0Items);
			formatPrice.mockReturnValue(mockCartHeaderData.data_getCartHeader_0Items.formattedPrice);

			document.body.appendChild(element);

			return flushPromises().then(() => {
				const cartHeaderLink = element.shadowRoot.querySelector('.cartHeaderLink');
				expect(cartHeaderLink.textContent).toContain(mockCartHeaderData.data_getCartHeader_0Items.displayString);
			});
		});

		it('displays correctly with two cart items and amount in thousands', () => {

			const element = createElement('c-b2b_CartHeader', {
				is: b2b_CartHeader
			});
			element.pageLabelValues.MyCart = mockCartHeaderData.data_getPageLabelValues['Component_SiteHeader_MyCart'];
			element.pageLabelValues.Item = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Item'];
			element.pageLabelValues.Items = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Items'];

			getCartHeaderWireAdapter.emit(mockCartHeaderData.data_getCartHeader_2Items);
			formatPrice.mockReturnValue(mockCartHeaderData.data_getCartHeader_2Items.formattedPrice);

			document.body.appendChild(element);

			return flushPromises().then(() => {
				const cartHeaderLink = element.shadowRoot.querySelector('.cartHeaderLink');
				expect(cartHeaderLink.textContent).toContain(mockCartHeaderData.data_getCartHeader_2Items.displayString);
			});
		});
	});

	describe('b2b_CartHeader navigateToCart', () => {

		it('correctly calls gotoCartPage when Cart Header Link is clicked ', () => {

			const element = createElement('c-b2b_CartHeader', {
				is: b2b_CartHeader
			});

			element.pageLabelValues.MyCart = mockCartHeaderData.data_getPageLabelValues['Component_SiteHeader_MyCart'];
			element.pageLabelValues.Item = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Item'];
			element.pageLabelValues.Items = mockCartHeaderData.data_getPageLabelValues['Component_MiniCart_Items'];

			getCartHeaderWireAdapter.emit(mockCartHeaderData.data_getCartHeader_2Items);
			formatPrice.mockReturnValue(mockCartHeaderData.data_getCartHeader_2Items.formattedPrice);
			
			document.body.appendChild(element);

			return flushPromises().then(() => {
				const cartHeaderLink = element.shadowRoot.querySelector('.cartHeaderLink');
				cartHeaderLink.click();
				expect(gotoCartPage).toHaveBeenCalled();
				expect(gotoCartPage).toHaveBeenCalledWith({
					encryptedId: mockCartHeaderData.data_getCartHeader_2Items['encryptedId']
				});
			});
		});
	});
});


	
