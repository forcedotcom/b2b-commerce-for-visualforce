/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {api, LightningElement} from 'lwc';
import {initContext, mergePageLabelData, setCookieWithPath} from 'c/b2b_CommonServices';
import getEffectiveAccounts from '@salesforce/apex/ccrz.b2b_lwc_EffectiveAccountController.getEffectiveAccounts';

export default class b2b_EffectiveAccountHeader extends LightningElement {

	@api configValues = {};
	@api pageLabelValues = {};
	@api isGuest;

	effectiveAccountLinkText;
	effectiveAccountList;
	displayEAHeader;

	connectedCallback() {
		this.getEffectiveAccountData();
	}

	handleShowModal(event) {
		event.preventDefault();
		event.stopPropagation();
		const modal = this.template.querySelector('c-b2b_-effective-account-modal');
		modal.show();
	}

	handleModalOnBlur(event) {
		event.preventDefault();
		event.stopPropagation();
		const modal = this.template.querySelector('c-b2b_-effective-account-modal');
		modal.hide();
	};

	getEffectiveAccountData(){
		// Do not display effective account header if a guest
		if (this.isGuest) {
			this.displayEAHeader = false;
		}else{
			getEffectiveAccounts({
				inputData: initContext({})
			}).then(result => {
				if (result && result.success && result.effectiveAccountList.length) {
					let eaLinkTextMergeData = [result.activeEffectiveAccount.name, result.activeEffectiveAccount.accountNumber];
					if (result.activeEffectiveAccount['shippingAddress']) {
						eaLinkTextMergeData = eaLinkTextMergeData.concat([result.activeEffectiveAccount.shippingAddress['address1']
							,result.activeEffectiveAccount.shippingAddress['city']
							,result.activeEffectiveAccount.shippingAddress['state']
							,result.activeEffectiveAccount.shippingAddress['countryCode']]);
					}
					this.effectiveAccountLinkText = mergePageLabelData(this.pageLabelValues.SelectedAccount, eaLinkTextMergeData);
					this.displayEAHeader = true;
					// a shallow copy won't be extensible, so we need to deep copy to add the property to house formatted address data
					this.effectiveAccountList = result.effectiveAccountList.map((eaData) =>
						Object.assign({}, eaData, {eaModalAddress:''}));
					for (let i in this.effectiveAccountList) {
						let eaShippingAddressMergeData = (!this.effectiveAccountList[i]['shippingAddress'])? [] :
							[this.effectiveAccountList[i].shippingAddress['address1']
							,this.effectiveAccountList[i].shippingAddress['city']
							,this.effectiveAccountList[i].shippingAddress['state']
							,this.effectiveAccountList[i].shippingAddress['postalCode']
							,this.effectiveAccountList[i].shippingAddress['countryCode']];
						this.effectiveAccountList[i].eaModalAddress = mergePageLabelData(this.pageLabelValues.AddressFormat, eaShippingAddressMergeData).replace(/<br\s*\/?>/mg, "\n");
					}

					setCookieWithPath('effacc', result.activeEffectiveAccount.sfid, 50, '/');

					// Do not display effective account header if there are no effective accounts returned
				} else if (result && result.success && !result.effectiveAccountList.length) {
					this.displayEAHeader = false;
				}
			}).catch(error => {
				console.error('[b2blwc.b2b_EffectiveAccountHeader.getEffectiveAccountData]: error in getEffectiveAccounts ' + error);
				this.error = error;
				this.records = undefined;
			});
		}
	}
}