import { test, expect, Page } from "@playwright/test";

async function adminLogin(page: Page) {
  await page.goto("/administrator/login");
  await page.fill("input[type='email']",    "admin@asbrandstore.com");
  await page.fill("input[type='password']", "***REMOVED***");
  await page.click("button[type='submit']");
  await page.waitForURL("**/administrator/dashboard", { timeout: 15000 });
}

test.describe("Admin CRUD & Storefront Instant Sync", () => {

  test("1. Create, Verify and Delete Category", async ({ page }) => {
    // 1. Login and go to categories management
    await adminLogin(page);
    await page.click("button:has-text('الفئات')");
    await page.waitForTimeout(1000);

    const testCatName = "E2E Cat " + Date.now();

    // 2. Open create modal
    await page.click("button:has-text('إضافة فئة')");
    await page.waitForSelector("input[type='text']");
    
    // Fill category form
    // Category Name (first input)
    await page.locator("input[type='text']").nth(0).fill(testCatName);
    // Icon name (second input)
    await page.locator("input[type='text']").nth(1).fill("Smartphone");
    // Image URL (third input inside uploader)
    // The ImageUploader has a text input for value or we can bypass it by injecting value
    // Let's check how ImageUploader value is set. It uses activeCategory.imageUrl.
    // In our test, let's find the file input or URL input.
    // Wait, let's locate the uploader component. It renders a Drag & Drop area.
    // If it requires ImageUrl, does it have an input or can we upload?
    // Let's inspect what ImageUploader renders. It has an input type="file" inside!
    // We can simulate file upload using setInputFiles!
    // Or we can just set the state if possible. But since it's E2E, we can use setInputFiles.
    // 3. Upload image
    await page.setInputFiles("input[type='file']", {
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data-here')
    });
    
    // Wait for upload simulation (or mock response if it hits Cloudinary)
    // Wait, the API call to "/images/upload" might fail if Cloudinary settings are wrong, but we configured real credentials!
    // Let's wait for upload to complete (saving status or URL visible)
    await page.waitForTimeout(3000);
    
    // Click submit button: "حفظ الفئة"
    await page.click("button:has-text('حفظ الفئة')");
    await page.waitForTimeout(2000);

    // 3. Go to storefront categories page
    await page.goto("/categories");
    await page.waitForTimeout(2000);

    // Verify it exists in storefront instantly!
    await expect(page.locator(`text=${testCatName}`)).toBeVisible();

    // 4. Delete the category
    await adminLogin(page);
    await page.click("button:has-text('الفئات')");
    await page.waitForTimeout(1000);
    
    // Click delete on our category card
    const catCard = page.locator("div").filter({ hasText: testCatName }).last();
    await catCard.locator("button:has-text('حذف')").click();
    await page.waitForTimeout(1500);

    // 5. Go to storefront and verify it is gone!
    await page.goto("/categories");
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${testCatName}`)).toHaveCount(0);
  });
});
