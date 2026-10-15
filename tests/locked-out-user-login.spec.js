const { test, expect } = require('@playwright/test');

const baseUrl = 'https://www.saucedemo.com/';
const username = 'locked_out_user';
const password = 'secret_sauce';
const expectedError = 'Epic sadface: Sorry, this user has been locked out.';

test.describe('Q1 - Locked out user login', () => {
    test('should show an error message for locked_out_user', async ({ page }) => {

        // Open website
        await page.goto(baseUrl);

        // Enter credentials
        await page.locator("//input[@id='user-name']").fill(username);
        await page.locator("//input[@id='password']").fill(password);

        // Click login
        await page.locator("//input[@id='login-button']").click();

        // Verify error message
        const errorMessage = page.locator("//h3[@data-test='error']");

        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toHaveText(expectedError);

        // Verify user stays on login page
        await expect(page).toHaveURL(baseUrl);
    });
});
