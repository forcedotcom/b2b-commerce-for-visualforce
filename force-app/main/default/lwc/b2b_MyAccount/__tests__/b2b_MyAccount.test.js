import { createElement } from 'lwc';
import b2b_MyAccount from 'c/b2b_MyAccount';
import { initContext, mergePageLabelData, buildPageUrl, gotoPage, buildUrl } from 'c/b2b_CommonServices';
import getMyAccountMenu from '@salesforce/apex/ccrz.b2b_lwc_MyAccountController.getMyAccountMenu';
import getStorefront from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName';
import getUserInfo from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getUserInfo';

// Provision data through @wire
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';

// Register any wires associated to your component
const getStorefrontWireAdapter = registerLdsTestWireAdapter(getStorefront);
const getMyAccountMenuWireAdapter = registerLdsTestWireAdapter(getMyAccountMenu);
const getUserInfoWireAdapter = registerLdsTestWireAdapter(getUserInfo);

jest.mock('c/b2b_CommonServices', () => {
    return {
        initContext: jest.fn(),
        mergePageLabelData: jest.fn(),
        buildPageUrl: jest.fn(),
        gotoPage: jest.fn(),
        buildUrl: jest.fn()
    };
}, {
    virtual: true
});

// Load in the JSON data
const mockMyAccountMenuData = require('./data/myAccountMenu.json');
const mockMyAccountMenuNoData = require('./data/myAccountMenuEmpty.json');

function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
}

describe('c-b2b_MyAccount', () => {

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    describe('b2b_MyAccount menuBehavior', () => {

        it('properly handles toggleMenu open & close', () => {
            const element = createElement('c-b2b-MyAccount', {
                is: b2b_MyAccount
            });
            element.isGuest = false;

            buildPageUrl.mockResolvedValue('https://mock.buildpage.url');
            buildUrl.mockResolvedValue('https://mock.build.url');
            getMyAccountMenuWireAdapter.emit(mockMyAccountMenuData);
            getStorefrontWireAdapter.emit("DefaultStore");

            document.body.appendChild(element);

            return flushPromises().then(() => {
                const menu = element.shadowRoot.querySelector('.dropdown-toggle');
                const menuList = element.shadowRoot.querySelector('.dropdown');
                expect(menuList.classList.contains("open")).toBe(false);
                menu.click();
                expect(menuList.classList.contains("open")).toBe(true);
                menu.click();
                expect(menuList.classList.contains("open")).toBe(false);
            });
        });
    });

    describe('b2b_MyAccount userMenuData', () => {

        // If NOT guest user --> should have all menu items (3, My Carts, My Orders, Logout)
        it('properly handles guest user when false', () => {
            const element = createElement('c-b2b-MyAccount', {
                is: b2b_MyAccount
            });
            element.isGuest = false;

            getStorefrontWireAdapter.emit("DefaultStore");
            getMyAccountMenuWireAdapter.emit(mockMyAccountMenuData);

            document.body.appendChild(element);

            return flushPromises().then(() => {
                const loginElem = element.shadowRoot.querySelectorAll('.goToLogin');
                const menuElem = element.shadowRoot.querySelectorAll('.my-account-menu-item');
                expect(loginElem.length).toBe(0);
                expect(menuElem.length).toBe(4); // 3 menus plus 1 logout link
            });
        });

        // If guest user --> should only have 0 menu items, but a Login link
        it('properly handles guest user when true', () => {
            const element = createElement('c-b2b-MyAccount', {
                is: b2b_MyAccount
            });

            element.isGuest = true;
            getStorefrontWireAdapter.emit("DefaultStore");
            getMyAccountMenuWireAdapter.emit(mockMyAccountMenuData);
            buildPageUrl.mockResolvedValue('https://lwc-jest-domain.com/DefaultStore/CCSiteLogin?cclcl=en_US');

            document.body.appendChild(element);

            return flushPromises().then(() => {
                const loginElem = element.shadowRoot.querySelectorAll('.goToLogin');
                const menuElem = element.shadowRoot.querySelectorAll('.my-account-menu-item');
                expect(loginElem.length).toBe(1);
                expect(loginElem[0].getAttribute("href")).toContain("DefaultStore");
                expect(menuElem.length).toBe(0);
            });
        });

        it('properly handles loading Logout menu item only when no data returned', () => {
            const element = createElement('c-b2b-MyAccount', {
                is: b2b_MyAccount
            });
            element.isGuest = false;

            getStorefrontWireAdapter.emit("DefaultStore");
            getMyAccountMenuWireAdapter.emit(mockMyAccountMenuNoData);

            document.body.appendChild(element);

            return flushPromises().then(() => {
                const loginElem = element.shadowRoot.querySelectorAll('.goToLogin');
                const menuElem = element.shadowRoot.querySelectorAll('.my-account-menu-item');
                expect(loginElem.length).toBe(0);
                expect(menuElem.length).toBe(2);
                expect(menuElem[1].getAttribute("href")).toContain("DefaultStore");
            });
        });
    });
});