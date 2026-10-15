const { test, expect } = require('@playwright/test');

const {
    loginToApplication,
    resetApplicationState,
    logoutFromApplication,
    fillCheckoutInformation,
} = require('../helpers/application-helper');

// Test data
const username = 'standard_user';
const password = 'secret_sauce';

const customer = {
    firstName: 'Test',
    lastName: 'User',
    postalCode: '1207',
};

const selectedProducts = [
    { id: 'sauce-labs-backpack', name: 'Sauce Labs Backpack' },
    { id: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light' },
    { id: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt' },
];

const expectedSubtotal = 'Item total: $55.97';
const expectedTax = 'Tax: $4.48';
const expectedTotal = 'Total: $60.45';
const successMessage = 'Thank you for your order!';

test.describe('Q2 - Standard user purchase journey', () => {
    test('should complete the purchase with three items', async ({ page }) => {

        // Login
        await loginToApplication(page, username, password);
        await expect(page).toHaveURL(/inventory.html/);

        // Verify inventory page
        await expect(
            page.locator("//div[@data-test='inventory-list']")
        ).toBeVisible();

        // Reset App State
        await resetApplicationState(page);

        // Add three products to cart
        for (const product of selectedProducts) {
            await page.locator(
                `//button[@id='add-to-cart-${product.id}']`
            ).click();
        }

        // Verify cart count
        await expect(
            page.locator("//span[contains(@class,'shopping_cart_badge')]")
        ).toHaveText('3');

        // Open cart
        await page.locator(
            "//div[@id='shopping_cart_container']//a"
        ).click();

        await expect(page).toHaveURL(/cart.html/);

        // Start checkout
        await page.locator("//button[@id='checkout']").click();

        // Fill customer information
        await fillCheckoutInformation(page, customer);

        // Verify checkout page
        await expect(page).toHaveURL(/checkout-step-two.html/);

        // Verify product names
        const expectedProductNames = selectedProducts.map(
            product => product.name
        );

        const productNames = page.locator(
            "//div[contains(@class,'inventory_item_name')]"
        );

        await expect(productNames).toHaveText(expectedProductNames);

        // Verify subtotal
        await expect(
            page.locator("//div[@class='summary_subtotal_label']")
        ).toHaveText(expectedSubtotal);

        // Verify tax
        await expect(
            page.locator("//div[@class='summary_tax_label']")
        ).toHaveText(expectedTax);

        // Verify total price
        await expect(
            page.locator("//div[@class='summary_total_label']")
        ).toHaveText(expectedTotal);

        // Finish purchase
        await page.locator("//button[@id='finish']").click();

        await expect(page).toHaveURL(/checkout-complete.html/);

        // Verify successful order
        await expect(
            page.locator("//h2[@data-test='complete-header']")
        ).toHaveText(successMessage);

        // Reset App State again
        await resetApplicationState(page);

        // Log out
        await logoutFromApplication(page);

        await expect(
            page.locator("//input[@id='login-button']")
        ).toBeVisible();
    });
});
