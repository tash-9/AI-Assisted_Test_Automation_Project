const { test, expect } = require('@playwright/test');

const {
    loginToApplication,
    resetApplicationState,
    logoutFromApplication,
    fillCheckoutInformation,
} = require('../helpers/application-helper');

// Test data
const username = 'performance_glitch_user';
const password = 'secret_sauce';

const customer = {
    firstName: 'Test',
    lastName: 'User',
    postalCode: '1207',
};

const expectedProduct = 'Test.allTheThings() T-Shirt (Red)';
const expectedSubtotal = 'Item total: $15.99';
const expectedTax = 'Tax: $1.28';
const expectedTotal = 'Total: $17.27';
const successMessage = 'Thank you for your order!';

const timeout = 20000;

test.describe('Q3 - Performance glitch user purchase journey', () => {
    test('should buy the first product after sorting Z to A', async ({ page }) => {
        test.setTimeout(50000);

        // Login
        await loginToApplication(page, username, password);
        await expect(page).toHaveURL(/inventory.html/, { timeout });

        // Reset App State
        await resetApplicationState(page);

        // Sort products by name (Z to A)
        await page.locator(
            "//select[@data-test='product-sort-container']"
        ).selectOption('za');

        // Verify the first product after sorting
        const productNames = page.locator(
            "//div[@data-test='inventory-item-name']"
        );

        await expect(productNames.first()).toHaveText(expectedProduct);

        // Add the first product to the cart
        await page.locator(
            "(//div[@data-test='inventory-item'])[1]//button"
        ).click();

        await expect(
            page.locator("//span[@class='shopping_cart_badge']")
        ).toHaveText('1');

        // Go to the cart and start checkout
        await page.locator("//a[@class='shopping_cart_link']").click();

        await expect(page).toHaveURL(/cart.html/, { timeout });

        await page.locator("//button[@id='checkout']").click();

        // Fill customer information
        await fillCheckoutInformation(page, customer);

        // Verify checkout page and product name
        await expect(page).toHaveURL(/checkout-step-two.html/, {
            timeout
        });

        await expect(productNames).toHaveText([expectedProduct]);

        // Verify subtotal, tax, and total price
        await expect(
            page.locator("//div[@class='summary_subtotal_label']")
        ).toHaveText(expectedSubtotal);

        await expect(
            page.locator("//div[@class='summary_tax_label']")
        ).toHaveText(expectedTax);

        await expect(
            page.locator("//div[@class='summary_total_label']")
        ).toHaveText(expectedTotal);

        // Finish purchase
        await page.locator("//button[@id='finish']").click();

        await expect(page).toHaveURL(/checkout-complete.html/, {
            timeout
        });

        // Verify successful order
        await expect(
            page.locator("//h2[@class='complete-header']")
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
