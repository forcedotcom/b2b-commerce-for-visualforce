import {api, LightningElement, wire} from 'lwc';
import setEffectiveAccount from '@salesforce/apex/ccrz.b2b_lwc_EffectiveAccountController.setEffectiveAccount';
import getStorefront from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName';
import { buildUrl, gotoURL, initContext, setCookieWithPath } from 'c/b2b_CommonServices';

export default class b2b_EffectiveAccountModal extends LightningElement {
	
	@api pageLabelValues = {};
	@api effectiveaccountlist;
	@wire(getStorefront) storefront;
	showModal = false;
	
	@api show() {
		this.showModal = true;
	}
	
	@api hide() {
		this.showModal = false;
	}
	
	handleShowModal(event) {
		event.preventDefault();
		event.stopPropagation();
		this.show();
	}
	
	handleEAClick(event){
		event.stopPropagation();
		event.preventDefault();
		this.showModal = false;
		
		// Transform the effectAccountList passed in from header as a (SFID, EA-Record) pair.
		let sfidToEffectiveAccountMap = this.effectiveaccountlist.reduce(function(map, effectiveAccount) {
			map[effectiveAccount.sfid] = effectiveAccount;
			return map;
		}, {});
		
		// The SFID of the EA that was clicked on.
		let currentSfid = event.currentTarget.dataset.id;
		
		// The Call to the Controller to grab the contents/details of the Selected Effective Account user.
		// Note: We pass in effAccountId so that it can be properly inserted in b2bContext param for cc_CallContext.initLightningContext
		setEffectiveAccount({
			inputData: initContext({
				effAccountId : currentSfid,
				selectedEffectiveAccount : sfidToEffectiveAccountMap[currentSfid]
			})
		}).then(selectedEAResult => {
			if(selectedEAResult && selectedEAResult.success){
				setCookieWithPath('effacc', currentSfid, 50, '/');

				// Build the URL for the Home Page (configured via hp.type and hp.exturl) of the specific EA User.
				buildUrl({
					url: 'HOME'
				}).then(buildUrlResult => {
					let paramSymbol = (buildUrlResult.indexOf('?') === -1) ? '?' : '&';
					let url = buildUrlResult + paramSymbol + 'effectiveAccount=' + currentSfid;
					// Navigate to the URL with the specified params from above and any others built from goToUrl.
					gotoURL({url: url});
				}).catch(error => {
					console.error('[b2blwc.b2b_EffectiveAccountModal.handleEAClick]: error in buildUrl ' + error);
					
				});
			}
		}).catch(error => {
			console.error('[b2blwc.b2b_EffectiveAccountModal.handleEAClick]: error in setEffectiveAccount ' + error);
		});
	}
}