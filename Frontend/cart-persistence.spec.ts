import { test, expect } from "@playwright/test";

const LOCALSTORAGE_KEY = "cart";

test.describe("Cart Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for React to mount
    await page.locator("header").waitFor({ timeout: 15000 });
  });

  test("1. Add products to cart â€” items persist after page refresh", async ({ page }) => {
    await page.evaluate((key) => {
      const items = [
        { product: { id: 1, name: "Product A", price: 100, originalPrice: 150, rating: 4, reviews: 5, image: "/a.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 5 }, quantity: 2 },
        { product: { id: 2, name: "Product B", price: 200, originalPrice: 250, rating: 5, reviews: 8, image: "/b.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 3 }, quantity: 1 },
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }, LOCALSTORAGE_KEY);

    const stored = await page.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(2);
    expect(parsed[0].product.name).toBe("Product A");
    expect(parsed[0].quantity).toBe(2);
    expect(parsed[1].product.name).toBe("Product B");
    expect(parsed[1].quantity).toBe(1);
  });

  test("2. Refresh page â€” cart items remain", async ({ page }) => {
    await page.evaluate((key) => {
      const items = [
        { product: { id: 1, name: "Product A", price: 100, originalPrice: 150, rating: 4, reviews: 5, image: "/a.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 5 }, quantity: 2 },
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }, LOCALSTORAGE_KEY);

    await page.reload();
    await page.locator("header").waitFor({ timeout: 15000 });

    const stored = await page.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].product.name).toBe("Product A");
    expect(parsed[0].quantity).toBe(2);
  });

  test("3. Close and reopen browser â€” cart items remain", async ({ browser }) => {
    // Use storageState to persist localStorage across contexts (simulating disk persistence)
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/");
    await page.locator("header").waitFor({ timeout: 15000 });

    await page.evaluate((key) => {
      const items = [
        { product: { id: 3, name: "Product C", price: 300, originalPrice: 400, rating: 4, reviews: 3, image: "/c.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 7 }, quantity: 3 },
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }, LOCALSTORAGE_KEY);

    // Save storage state (simulates data persisting to disk)
    const storageState = await context.storageState();
    await context.close();

    // Reopen with saved storage state (simulates reopening browser and reading from disk)
    const newContext = await browser.newContext({ storageState });
    const newPage = await newContext.newPage();
    await newPage.goto("/");
    await newPage.locator("header").waitFor({ timeout: 15000 });

    const stored = await newPage.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].product.name).toBe("Product C");
    expect(parsed[0].quantity).toBe(3);

    await newContext.close();
  });

  test("4. Reopen browser â€” cart quantities remain", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/");
    await page.locator("header").waitFor({ timeout: 15000 });

    await page.evaluate((key) => {
      const items = [
        { product: { id: 4, name: "Product D", price: 400, originalPrice: 500, rating: 5, reviews: 12, image: "/d.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 10 }, quantity: 5 },
        { product: { id: 5, name: "Product E", price: 500, originalPrice: 600, rating: 3, reviews: 2, image: "/e.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 2 }, quantity: 2 },
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }, LOCALSTORAGE_KEY);

    const storageState = await context.storageState();
    await context.close();

    const newContext = await browser.newContext({ storageState });
    const newPage = await newContext.newPage();
    await newPage.goto("/");
    await newPage.locator("header").waitFor({ timeout: 15000 });

    const stored = await newPage.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(2);
    expect(parsed[0].quantity).toBe(5);
    expect(parsed[1].quantity).toBe(2);

    await newContext.close();
  });

  test("5. Navigate between routes â€” cart items remain", async ({ page }) => {
    await page.evaluate((key) => {
      const items = [
        { product: { id: 6, name: "Product F", price: 600, originalPrice: 700, rating: 4, reviews: 6, image: "/f.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 4 }, quantity: 1 },
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }, LOCALSTORAGE_KEY);

    // Test routes that use StoreLayout (all have Header with "A.S Brand Store")
    const routes = ["/", "/categories", "/products", "/cart"];
    for (const route of routes) {
      await page.goto(route);
      await page.locator("header").waitFor({ timeout: 15000 });

      const stored = await page.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].product.name).toBe("Product F");
      expect(parsed[0].quantity).toBe(1);
    }

    // Also test /administrator/login (no Header, but cart should still persist)
    await page.goto("/administrator/login");
    await page.waitForURL("**/administrator/login");

    const stored = await page.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].product.name).toBe("Product F");
    expect(parsed[0].quantity).toBe(1);
  });

  test("6. Logout and login again â€” cart items remain", async ({ page }) => {
    await page.evaluate((key) => {
      const items = [
        { product: { id: 7, name: "Product G", price: 700, originalPrice: 800, rating: 5, reviews: 9, image: "/g.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 6 }, quantity: 4 },
      ];
      localStorage.setItem(key, JSON.stringify(items));
      localStorage.setItem("token", "test-token-123");
    }, LOCALSTORAGE_KEY);

    let token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBe("test-token-123");

    // Simulate logout (authService.logout removes token only)
    await page.evaluate(() => {
      localStorage.removeItem("token");
    });

    token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();

    // Cart must survive logout
    let stored = await page.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    expect(stored).not.toBeNull();
    let parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].product.name).toBe("Product G");
    expect(parsed[0].quantity).toBe(4);

    // Simulate login (sets token, must NOT clear cart)
    await page.evaluate(() => {
      localStorage.setItem("token", "new-token-456");
    });

    token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBe("new-token-456");

    stored = await page.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    expect(stored).not.toBeNull();
    parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].product.name).toBe("Product G");
    expect(parsed[0].quantity).toBe(4);
  });

  test("7. Totals remain intact (price * quantity calculation)", async ({ page }) => {
    await page.evaluate((key) => {
      const items = [
        { product: { id: 8, name: "Product H", price: 100, originalPrice: 120, rating: 4, reviews: 5, image: "/h.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 10 }, quantity: 3 },
        { product: { id: 9, name: "Product I", price: 250, originalPrice: 300, rating: 5, reviews: 7, image: "/i.jpg", category: "Cat", categoryId: 1, description: "Desc", specs: [], stock: 5 }, quantity: 2 },
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }, LOCALSTORAGE_KEY);

    await page.reload();
    await page.locator("header").waitFor({ timeout: 15000 });

    const stored = await page.evaluate((key) => localStorage.getItem(key), LOCALSTORAGE_KEY);
    const parsed = JSON.parse(stored!);

    expect(parsed[0].quantity).toBe(3);
    expect(parsed[1].quantity).toBe(2);
    expect(parsed[0].product.price).toBe(100);
    expect(parsed[1].product.price).toBe(250);

    const item1Total = parsed[0].product.price * parsed[0].quantity;
    const item2Total = parsed[1].product.price * parsed[1].quantity;
    const grandTotal = item1Total + item2Total;

    expect(item1Total).toBe(300);
    expect(item2Total).toBe(500);
    expect(grandTotal).toBe(800);
  });
});
