import {createElement} from 'lwc';
import b2b_EffectiveAccountHeader from 'c/b2b_EffectiveAccountHeader';
import getEffectiveAccounts from '@salesforce/apex/ccrz.b2b_lwc_EffectiveAccountController.getEffectiveAccounts';
import {mergePageLabelData, setCookieWithPath} from 'c/b2b_CommonServices';

const mockEffectiveAccountHeaderData = require('./data/b2b_effectiveAccountHeader.json');

jest.mock('@salesforce/apex/ccrz.b2b_lwc_EffectiveAccountController.getEffectiveAccounts', () => {
	return {
		default: jest.fn()
	};
}, {
	virtual: true
});

jest.mock('c/b2b_CommonServices', () => {
	return {
		initContext: jest.fn(),
		mergePageLabelData: jest.fn(),
		setCookieWithPath: jest.fn()
	};
}, {
	virtual: true
});

function flushPromises() {
	return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_EffectiveAccountHeader', () => {
	
	afterEach(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild);
		}
		jest.resetAllMocks();
	});
	
	describe('b2b_EffectiveAccountHeader effectiveAccountLinkText display', () => {
		it('displays correct effectiveAccountLinkText when data is returned ', () => {

			const element = createElement('c-b2b-b2b_EffectiveAccountHeader', {
				is: b2b_EffectiveAccountHeader
			});

			element.isGuest = false;
			element.pageLabelValues.SelectedAccount = mockEffectiveAccountHeaderData.data_getPageLabelValues['SELECTED_ACCOUNT'];

			getEffectiveAccounts.mockResolvedValue(mockEffectiveAccountHeaderData.data_getEffectiveAccounts);
			mergePageLabelData.mockReturnValueOnce(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_mergePageLabelData_activeEffectiveAccount);
			mergePageLabelData.mockReturnValueOnce(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_mergePageLabelData_effectiveAccountList1);
			mergePageLabelData.mockReturnValueOnce(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_mergePageLabelData_effectiveAccountList2);

			document.body.appendChild(element);

			return flushPromises().then(() => {
				const eaLinkContainer = element.shadowRoot.querySelector('.cc_eff_account');
				expect(getEffectiveAccounts).toHaveBeenCalled();
				expect(mergePageLabelData).toHaveBeenCalled();
				let eaLinkTextMergeData = [mockEffectiveAccountHeaderData.data_getEffectiveAccounts.activeEffectiveAccount.name, mockEffectiveAccountHeaderData.data_getEffectiveAccounts.activeEffectiveAccount.accountNumber, mockEffectiveAccountHeaderData.data_getEffectiveAccounts.activeEffectiveAccount.shippingAddress.address1, mockEffectiveAccountHeaderData.data_getEffectiveAccounts.activeEffectiveAccount.shippingAddress.city, mockEffectiveAccountHeaderData.data_getEffectiveAccounts.activeEffectiveAccount.shippingAddress.state, mockEffectiveAccountHeaderData.data_getEffectiveAccounts.activeEffectiveAccount.shippingAddress.countryCode];
				expect(mergePageLabelData).toHaveBeenCalledWith(element.pageLabelValues.SelectedAccount, eaLinkTextMergeData);
				expect(eaLinkContainer.textContent).toBe(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_mergePageLabelData_activeEffectiveAccount);
			});
		});

		it('calls child modal component show() when link is clicked', () => {
			
			getEffectiveAccounts.mockResolvedValue(mockEffectiveAccountHeaderData.data_getEffectiveAccounts);
			mergePageLabelData.mockReturnValueOnce(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_mergePageLabelData_activeEffectiveAccount);
			mergePageLabelData.mockReturnValueOnce(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_mergePageLabelData_effectiveAccountList1);
			mergePageLabelData.mockReturnValueOnce(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_mergePageLabelData_effectiveAccountList2);

			const element = createElement('c-b2b-b2b_EffectiveAccountHeader', {
				is: b2b_EffectiveAccountHeader
			});

			element.isGuest = false;
			element.pageLabelValues.SelectedAccount = mockEffectiveAccountHeaderData.data_getPageLabelValues['SELECTED_ACCOUNT'];
			
			document.body.appendChild(element);

			return flushPromises().then(() => {
				const eaModal = element.shadowRoot.querySelector('c-b2b_-effective-account-modal');
				eaModal.show = jest.fn();
				const eaHeaderLink = element.shadowRoot.querySelector('.cc_eff_account > a');
				eaHeaderLink.click();
				expect(eaModal.show).toHaveBeenCalledTimes(1);
			});
		});

		it('does not display effectiveAccountLinkText when no effectiveAccountList is returned ', () => {

			getEffectiveAccounts.mockResolvedValue(mockEffectiveAccountHeaderData.data_getEffectiveAccounts_empty);

			const element = createElement('c-b2b-b2b_EffectiveAccountHeader', {
				is: b2b_EffectiveAccountHeader
			});

			element.isGuest = false;
			element.pageLabelValues.SelectedAccount = mockEffectiveAccountHeaderData.data_getPageLabelValues['SELECTED_ACCOUNT'];
			
			document.body.appendChild(element);

			return flushPromises().then(() => {
				expect(getEffectiveAccounts).toHaveBeenCalled();
				expect(mergePageLabelData).toHaveBeenCalledTimes(0);
				const eaLinkContainer = element.shadowRoot.querySelector('.cc_eff_account');
				expect(eaLinkContainer).toBeNull();
			});

		});

		it('does not display effectiveAccountLinkText when isGuest is true ', () => {

			const element = createElement('c-b2b-b2b_EffectiveAccountHeader', {
				is: b2b_EffectiveAccountHeader
			});

			element.isGuest = true;
			element.pageLabelValues.SelectedAccount = mockEffectiveAccountHeaderData.data_getPageLabelValues['SELECTED_ACCOUNT'];
			
			document.body.appendChild(element);

			return flushPromises().then(() => {
				expect(getEffectiveAccounts).toHaveBeenCalledTimes(0);	
				expect(mergePageLabelData).toHaveBeenCalledTimes(0);
				const eaLinkContainer = element.shadowRoot.querySelector('.cc_eff_account');
				expect(eaLinkContainer).toBeNull();
			});

		});
	});
});