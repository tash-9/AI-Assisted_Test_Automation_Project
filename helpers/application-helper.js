
const { expect } = require('@playwright/test');

const baseUrl = 'https://www.saucedemo.com/';

async function loginToApplication(page, username, password) {
    await page.goto(baseUrl);

    await page.locator("//input[@id='user-name']").fill(username);
    await page.locator("//input[@id='password']").fill(password);
    await page.locator("//input[@id='login-button']").click();
}

async function openSideMenu(page) {
    await page.locator("//button[@id='react-burger-menu-btn']").click();

    // Wait for menu to open
    await page.locator("//a[@id='logout_sidebar_link']").waitFor({
        state: 'visible'
    });
}

async function closeSideMenu(page) {
    await page.locator("//button[@id='react-burger-cross-btn']").click();

    // Wait for menu to close
    await page.locator("//a[@id='logout_sidebar_link']").waitFor({
        state: 'hidden'
    });
}

async function resetApplicationState(page) {
    await openSideMenu(page);

    await page.locator("//a[@id='reset_sidebar_link']").click();

    await closeSideMenu(page);
}

async function logoutFromApplication(page) {
    await openSideMenu(page);

    await page.locator("//a[@id='logout_sidebar_link']").click();
}

async function fillCheckoutInformation(page, customer) {
    await page.waitForURL(/checkout-step-one.html/);

    const firstName = page.locator("//input[@id='first-name']");
    const lastName = page.locator("//input[@id='last-name']");
    const postalCode = page.locator("//input[@id='postal-code']");

    await firstName.fill(customer.firstName);
    await expect(firstName).toHaveValue(customer.firstName);

    await lastName.fill(customer.lastName);
    await expect(lastName).toHaveValue(customer.lastName);

    await postalCode.fill(customer.postalCode);
    await expect(postalCode).toHaveValue(customer.postalCode);

    await page.locator("//input[@id='continue']").click();
}

module.exports = {
    loginToApplication,
    resetApplicationState,
    logoutFromApplication,
    fillCheckoutInformation,
};
