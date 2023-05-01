/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { api, wire, LightningElement } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getCartHeader from '@salesforce/apex/ccrz.b2b_lwc_CartHeaderController.getCartHeader';
import { initContext, gotoCartPage, formatPrice } from 'c/b2b_CommonServices';

export default class b2b_CartHeader extends LightningElement {
	cartStatusPoll;

	@api pageLabelValues = {};

	@wire(getCartHeader, {inputData: initContext({}) }) cartData;

	get cartDisplayString() {
		const data = this.cartData.data;
		let cartDisplayString = this.pageLabelValues.MyCart;
		if (data && data.success && data.cartStatus !== "Repricing") {
			cartDisplayString += ": " + data.cartCount;
			cartDisplayString += " " + (data.cartCount === 1 ? this.pageLabelValues.Item : this.pageLabelValues.Items);

			const locale = data.ccCallContext.userLocale;
			const currency = data.ccCallContext.userIsoCode;
			cartDisplayString += " " + formatPrice(locale, currency, data.cartTotal);
			clearInterval(this.cartStatusPoll);
		}
		return cartDisplayString;
	};

	get isCartRepricing() {
		const data = this.cartData.data;
		let cartRepricing = false;
		if (data && data.success) {
			cartRepricing = data.cartStatus === "Repricing";
			if(cartRepricing) {
				// only create one poll
				if(!this.cartStatusPoll) {
					this.cartStatusPoll = setInterval(() => {
						refreshApex(this.cartData);
					}, 30000);
				}
			}
		}
		return cartRepricing;
	};

	navigateToCart(event){
		event.preventDefault();
		event.stopPropagation();
		const data = this.cartData.data;
		if (data && data.success) {
			gotoCartPage({
				encryptedId: data.encryptedId
			});
		}
	};
}