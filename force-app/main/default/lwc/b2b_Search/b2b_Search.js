/**
 * Created by salesforce.com, inc.
 * Copyright 2020 salesforce.com, inc. All rights reserved.
 * Redistribution and use in source or binary forms, with or without
 * modification is PROHIBITED.
 */

import {LightningElement, track, api} from 'lwc';
import {initContext, gotoProductListPage} from 'c/b2b_CommonServices';
import getAutocompleteResults from '@salesforce/apex/ccrz.b2b_lwc_SearchController.getAutocompleteResults';

export default class b2b_Search extends LightningElement {

	@api configValues = {};
	@api pageLabelValues = {};
	@track autocompleteArray;
	productSearchTooltipDisplay;

	constructor() {
		super();
	}

	handleSearchOnInputChange(event){
		event.preventDefault();

		// Auto Complete Requires At Least 3 Characters Before Making A Call
		const autoCompleteCharacterLimit = 3;

		// User Input Search Term
		const searchKey = event.target.value;

		this.autocompleteArray = null;
		this.productSearchTooltipDisplay = false;

		if(searchKey && searchKey.length >= autoCompleteCharacterLimit){
			getAutocompleteResults({
				inputData: initContext({
					searchString : searchKey,
					resultLimit : 10
				})
			}).then(result => {

				if(result.autocompleteValues && result.autocompleteValues.length > 0){
					this.autocompleteArray = [];
					for (let i = 0; i < result.autocompleteValues.length; i++) {
						let theResultObj = {key:i, value:result.autocompleteValues[i]};
						this.autocompleteArray.push(theResultObj);
					}
				}
				this.error = undefined;
			}).catch(error => {
				console.error('[b2blwc.getAutocompleteResults]: error loading autocomplete data ' + error);
				this.error = error;
				this.records = undefined;
			});
		}
	}

	handleSearchOnKeyDown(event){
		switch (event.key) {
			case 'Enter':
				this.handleSearch(event);
				break;
			case 'Down': // IE/Edge specific value
			case 'ArrowDown':
				this.autocompleteArrowSetActive(false);
				break;
			case 'Up': // IE/Edge specific value
			case 'ArrowUp':
				this.autocompleteArrowSetActive(true);
				break;
			case 'Esc': // IE/Edge specific value
			case 'Escape':
				this.autocompleteArray = null;
				break;
			default:
				break;
		}
	}

	handleAutocompleteOnMouseOver(event){
		const searchInputText = this.template.querySelector('.cc_search_input');
		const activeAutocompleteItem = this.template.querySelector('.ui-state-active');

		if(activeAutocompleteItem){
			activeAutocompleteItem.classList.remove('ui-state-active');
		}

		searchInputText.value = event.target.innerHTML;
		event.target.classList.add('ui-state-active');
	}

	handleAutocompleteOnClick(event){
		event.preventDefault();

		this.autocompleteArray = null;

		const searchInputText = this.template.querySelector('.cc_search_input');
		searchInputText.value = event.target.innerHTML;
		searchInputText.focus();
	}

	handleSearchOnBlur(event){
		if(!event.relatedTarget || !event.relatedTarget.classList || !event.relatedTarget.classList.contains('ui-menu-item-wrapper')){
			this.autocompleteArray = null;
		}
	}

	handleSearch(event){
		event.preventDefault();

		const searchInputText = this.template.querySelector('.cc_search_input');

		// Search Requires At Least 2 Characters Before Performing A Search
		const searchCharacterLimit = 2;

		if(searchInputText.value && searchInputText.value.length >= searchCharacterLimit){
			gotoProductListPage({
				searchString:searchInputText.value,
				useProductListPageV2:this.configValues.useProductListPageV2
			});
		}else {
			this.productSearchTooltipDisplay = true;
			const popOverDiv = this.template.querySelector('.productSearchTooltip');
			this.applyAutocompletePositioning(searchInputText, popOverDiv);
		}
	}

	autocompleteArrowSetActive(isArrowUp){
		const searchInputText = this.template.querySelector('.cc_search_input');
		const activeAutocompleteItem = this.template.querySelector('.ui-state-active');
		const autocompleteItems = this.template.querySelectorAll('.ui-menu-item-wrapper');
		if(!activeAutocompleteItem && autocompleteItems[0]){
			autocompleteItems[0].classList.add('ui-state-active');
			searchInputText.value = autocompleteItems[0].innerHTML;
		}else if (activeAutocompleteItem){
			let index = isArrowUp ?
				parseInt(activeAutocompleteItem.dataset.id) - 1 :
				parseInt(activeAutocompleteItem.dataset.id) + 1;
			activeAutocompleteItem.classList.remove('ui-state-active');
			if(autocompleteItems[index]){
				autocompleteItems[index].classList.add('ui-state-active');
				searchInputText.value = autocompleteItems[index].innerHTML;
			}
		}
	}
}