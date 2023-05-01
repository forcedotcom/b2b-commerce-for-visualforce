import {
	createElement
} from 'lwc';
import b2b_EffectiveAccountModal from 'c/b2b_EffectiveAccountModal';
import setEffectiveAccount from '@salesforce/apex/ccrz.b2b_lwc_EffectiveAccountController.setEffectiveAccount';
import getStorefront from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName';
import { buildUrl, gotoURL, initContext, setCookieWithPath } from 'c/b2b_CommonServices';
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';

const mockEffectiveAccountModalData = require('./data/b2b_effectiveAccountModal.json');
const getStorefrontWireAdapter = registerLdsTestWireAdapter(getStorefront);

jest.mock('@salesforce/apex/ccrz.b2b_lwc_EffectiveAccountController.setEffectiveAccount', () => {
	return {
		default: jest.fn()
	};
}, {
	virtual: true
});

jest.mock('@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName', () => {
	return {
		default: jest.fn()
	};
}, {
	virtual: true
});

jest.mock('c/b2b_CommonServices', () => {
	return {
		initContext: jest.fn(),
		buildUrl: jest.fn(),
		gotoURL: jest.fn(),
		setCookieWithPath: jest.fn()
	};
}, {
	virtual: true
});

function flushPromises() {
	return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_EffectiveAccountModal', () => {
	
	afterEach(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild);
		}
		jest.resetAllMocks();
	});
	
	describe('b2b_EffectiveAccountModal modal display', () => {

		it('will display modal when show is called ', () => {	
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});
			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			document.body.appendChild(element);

			const eaModalContainerBeforeShow = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
			expect(eaModalContainerBeforeShow).toBe(null);
			element.show();
			return flushPromises().then(() => {
				const eaModalContainerAfterShow = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
				expect(eaModalContainerAfterShow).not.toBe(null);
			});
		});

		it('will no longer display modal when hide is called', () => {
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});
			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			element.show();
			document.body.appendChild(element);

			const eaModalContainerBeforeHide = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
			expect(eaModalContainerBeforeHide).not.toBe(null);
			element.hide();
			
			return flushPromises().then(() => {
				const eaModalContainerAfterHide = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
				expect(eaModalContainerAfterHide).toBe(null);
			});
		});

		it('will no longer display modal when close button is clicked', () => {
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});
			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			element.show();
			document.body.appendChild(element);			

			const eaModalContainerBeforeClose = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
			expect(eaModalContainerBeforeClose).not.toBe(null);
			const eaModalCloseButton = element.shadowRoot.querySelector('.cc_close');
			eaModalCloseButton.click();

			return flushPromises().then(() => {
				const eaModalContainerAfterClose = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
				expect(eaModalContainerAfterClose).toBe(null);
			});
		});


		it('correctly displays modal header and table header values', () => {
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});

			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			element.show();
			document.body.appendChild(element);
			
			const eaModalTitle = element.shadowRoot.querySelector('.cc_modal_title');
			const eaModalName = element.shadowRoot.querySelector('.cc_th_name');
			const eaModalAccountNumber = element.shadowRoot.querySelector('.cc_th_account_number');
			const eaModalAddress = element.shadowRoot.querySelector('.cc_th_address');
			expect(eaModalTitle.textContent).toBe(mockEffectiveAccountModalData.data_getPageLabelValues.EffectiveAccountTitle);
			expect(eaModalName.textContent).toBe(mockEffectiveAccountModalData.data_getPageLabelValues.Name);
			expect(eaModalAccountNumber.textContent).toBe(mockEffectiveAccountModalData.data_getPageLabelValues.AccountNumber);
			expect(eaModalAddress.textContent).toBe(mockEffectiveAccountModalData.data_getPageLabelValues.Address);

		});

		it('correctly displays effective account list data', () => {
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});

			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			element.show();
			document.body.appendChild(element);
			
			const eaModalNames = element.shadowRoot.querySelectorAll('.cc_td_name');
			const eaModalAccountNumbers = element.shadowRoot.querySelectorAll('.cc_td_account_number');
			const eaModalAddresss = element.shadowRoot.querySelectorAll('.cc_td_address');
			expect(eaModalNames.length).toBe(2);
			expect(eaModalAccountNumbers.length).toBe(2);
			expect(eaModalAddresss.length).toBe(2);
			expect(eaModalNames[0].textContent).toBe(mockEffectiveAccountModalData.data_effectiveAccountList[0].name);
			expect(eaModalAccountNumbers[0].textContent).toBe(mockEffectiveAccountModalData.data_effectiveAccountList[0].accountNumber);
			expect(eaModalAddresss[0].textContent).toBe(mockEffectiveAccountModalData.data_effectiveAccountList[0].eaModalAddress);
			expect(eaModalNames[1].textContent).toBe(mockEffectiveAccountModalData.data_effectiveAccountList[1].name);
			expect(eaModalAccountNumbers[1].textContent).toBe(mockEffectiveAccountModalData.data_effectiveAccountList[1].accountNumber);
			expect(eaModalAddresss[1].textContent).toBe(mockEffectiveAccountModalData.data_effectiveAccountList[1].eaModalAddress);
		});
	});

	describe('b2b_EffectiveAccountModal handleEAClick', () => {

		it('will no longer display modal when effective account is selected', () => {
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});
			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			element.show();
			document.body.appendChild(element);

			getStorefrontWireAdapter.emit(mockEffectiveAccountModalData.data_storefrontName);
			setEffectiveAccount.mockResolvedValue(mockEffectiveAccountModalData.data_setEffectiveAccount);
			buildUrl.mockResolvedValue(mockEffectiveAccountModalData.data_buildUrlResultWithParam);

			const eaModalContainerBeforeClose = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
			expect(eaModalContainerBeforeClose).not.toBe(null);

			const effectiveAccountSelectLink = element.shadowRoot.querySelector('.cc_pick_account');
			effectiveAccountSelectLink.click();

			return flushPromises().then(() => {
				const eaModalContainerAfterClose = element.shadowRoot.querySelector('.cc_effective_accounts_modal');
				expect(eaModalContainerAfterClose).toBe(null);
			});
		});

		it('will call goToURL with correct URL when buildUrl returns url with params when effective account is selected', () => {
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});
			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			element.show();
			document.body.appendChild(element);

			getStorefrontWireAdapter.emit(mockEffectiveAccountModalData.data_storefrontName);
			setEffectiveAccount.mockResolvedValue(mockEffectiveAccountModalData.data_setEffectiveAccount);
			buildUrl.mockResolvedValue(mockEffectiveAccountModalData.data_buildUrlResultWithParam);
			
			const effectiveAccountSelectLinks = element.shadowRoot.querySelectorAll('.cc_pick_account');
			effectiveAccountSelectLinks[1].click();

			return flushPromises().then(() => {
				expect(setEffectiveAccount).toHaveBeenCalledTimes(1);
				expect(initContext).toHaveBeenCalledTimes(1);
				expect(initContext).toHaveBeenCalledWith({
					"effAccountId": mockEffectiveAccountModalData.data_effectiveAccountList[1].sfid,
					"selectedEffectiveAccount": mockEffectiveAccountModalData.data_effectiveAccountList[1]
				});
				expect(buildUrl).toHaveBeenCalledTimes(1);
				expect(gotoURL).toHaveBeenCalledTimes(1);
				expect(gotoURL).toHaveBeenCalledWith({
					"url": mockEffectiveAccountModalData.data_buildUrlResultWithParam + "&effectiveAccount=" + mockEffectiveAccountModalData.data_effectiveAccountList[1].sfid
				});
			});
		});

		it('will call goToURL with correct URL when buildUrl returns url without params when effective account is selected', () => {
			const element = createElement('c-b2b_EffectiveAccountModal', {
				is: b2b_EffectiveAccountModal
			});
			element.pageLabelValues = mockEffectiveAccountModalData.data_getPageLabelValues;
			element.effectiveaccountlist = mockEffectiveAccountModalData.data_effectiveAccountList;
			element.show();
			document.body.appendChild(element);

			getStorefrontWireAdapter.emit(mockEffectiveAccountModalData.data_storefrontName);
			setEffectiveAccount.mockResolvedValue(mockEffectiveAccountModalData.data_setEffectiveAccount);
			buildUrl.mockResolvedValue(mockEffectiveAccountModalData.data_buildUrlResultWithoutParam);

			const effectiveAccountSelectLinks = element.shadowRoot.querySelectorAll('.cc_pick_account');
			effectiveAccountSelectLinks[1].click();

			return flushPromises().then(() => {
				expect(setEffectiveAccount).toHaveBeenCalledTimes(1);
				expect(initContext).toHaveBeenCalledTimes(1);
				expect(initContext).toHaveBeenCalledWith({
					"effAccountId": mockEffectiveAccountModalData.data_effectiveAccountList[1].sfid,
					"selectedEffectiveAccount": mockEffectiveAccountModalData.data_effectiveAccountList[1]
				});
				expect(buildUrl).toHaveBeenCalledTimes(1);
				expect(gotoURL).toHaveBeenCalledTimes(1);
				expect(gotoURL).toHaveBeenCalledWith({
					"url": mockEffectiveAccountModalData.data_buildUrlResultWithoutParam + "?effectiveAccount=" + mockEffectiveAccountModalData.data_effectiveAccountList[1].sfid
				});
			});
		});
	});
});