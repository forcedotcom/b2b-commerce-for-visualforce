/**
 * Created by salesforce.com, inc.
 * Copyright 2020 salesforce.com, inc. All rights reserved.
 * Redistribution and use in source or binary forms, with or without
 * modification is PROHIBITED.
 */

import {api, LightningElement, wire} from 'lwc';
import {initContext, buildUrl, gotoURL} from 'c/b2b_CommonServices';
import getMenus from '@salesforce/apex/ccrz.b2b_lwc_MenuController.getMenus';
import getStorefront from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName';

export default class b2b_MenuBar extends LightningElement {

	@api configValues = {};
	@api pageLabelValues = {};
	@api isGuest;

	@wire(getStorefront) storefront;
	@wire(getMenus,{inputData : initContext({})}) menuWiredData;

	homePageUrl = "#";

	connectedCallback() {
		this.determineHomePageUrl();
	};

	determineHomePageUrl() {
		buildUrl({
			url: 'HOME'
		}).then(result => {
			this.homePageUrl = result;
		}).catch(error => {
			console.error('[b2blwc.b2b_MenuBar error getting homePageUrl:', error);
		});
	};

	gotoHomePage(event) {
		event.preventDefault();
		event.stopPropagation();
		gotoURL({url: 'HOME'});
	};

	handleNavbarToggle(event) {
		const navbarButton = this.template.querySelector('.navbar-toggle');
		const navbar = this.template.querySelector('.navbar-collapse');
		let collapsed = navbarButton.classList.contains("collapsed");

		if (collapsed) {
			navbarButton.classList.remove("collapsed");
			navbarButton.setAttribute('aria-expanded', true);
			navbar.classList.add("in");
			navbar.setAttribute('aria-expanded', true);
			navbar.setAttribute('style', '');
		} else {
			navbarButton.classList.add("collapsed");
			navbarButton.setAttribute('aria-expanded', false);
			navbar.classList.remove("in");
			navbar.setAttribute('aria-expanded', false);
			navbar.setAttribute('style', 'height: 1px;');
		}
	};

	get menus() {
		const data = this.menuWiredData.data;

		let menuReturnData = [];
		if(data && data.success && data.menuData) {
			menuReturnData = data.menuData;
		} else if (data && !data.success) {
   			console.error("[b2blwc.b2b_MenuBar.menus]: Could not retrieve menu data. Success was false.");
		}
		return menuReturnData;
	};

	get myAccountMenu() {
		const data = this.menuWiredData.data;

		let menuReturnData;
		if(data && data.success && data.myAccountMenu) {
			menuReturnData = data.myAccountMenu[0];
		} else if (data && !data.success) {
   			console.error("[b2blwc.b2b_MenuBar.menus]: Could not retrieve MyAccount menu data. Success was false.");
		}
		return menuReturnData;
	};
}
