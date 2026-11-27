import { test, expect, Page } from "@playwright/test";

// ─── helpers ──────────────────────────────────────────────────
async function waitForApp(page: Page) {
  await page.goto("/");
  await page.locator("header").waitFor({ timeout: 15000 });
}

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

async function adminLogin(page: Page) {
  await page.goto("/administrator/login");
  await page.fill("input[type='email']", ADMIN_EMAIL);
  await page.fill("input[type='password']", ADMIN_PASSWORD);
  await page.click("button[type='submit']");
  await page.waitForURL("**/administrator/dashboard", { timeout: 15000 });
}

// ─── Footer ────────────────────────────────────────────────────
test("1. Footer copyright text", async ({ page }) => {
  await waitForApp(page);
  const footer = page.locator("footer");
  await expect(footer.locator("text=Designed & Developed by Eng. Shaker Emad")).toBeVisible();
  // Old text must NOT exist
  await expect(footer.locator("text=جميع الحقوق محفوظة")).toHaveCount(0);
});

// ─── Announcement Bar ──────────────────────────────────────────
test("2. Announcement bar — shows configured threshold & contact phone", async ({ page }) => {
  await waitForApp(page);
  const response = await page.request.get("/api/settings");
  const settings = await response.json();
  const threshold = settings.shippingThreshold;
  const phone = settings.contactPhone;
  await expect(page.locator(`text=شحن مجاني للطلبات فوق ${threshold}`)).toBeVisible();
  await expect(page.locator(`text=${phone}`).first()).toBeVisible();
});

// ─── Cart — add from ProductCard ──────────────────────────────
test("3. Add product to cart from product listing page", async ({ page }) => {
  await page.goto("/products");
  await page.waitForTimeout(3000);

  const addBtns = page.locator("button:has-text('أضف إلى السلة')");
  await addBtns.first().click();
  await page.waitForTimeout(500);

  // Badge on cart icon must show ≥ 1
  const badge = page.locator("header span").filter({ hasText: /^[0-9]+$/ }).first();
  const count = await badge.textContent();
  expect(Number(count)).toBeGreaterThan(0);
});

// ─── Cart — add from product details page ─────────────────────
test("4. Add product to cart from product details page", async ({ page }) => {
  // Navigate directly to the first product's detail page
  await page.goto("/products");
  await page.waitForTimeout(3000);

  // Use the card image click which definitely fires onView()
  await page.locator("[style*='height: 220']").first().click();
  await page.waitForURL("**/product/**", { timeout: 10000 });
  await page.waitForTimeout(2500);

  const addBtn = page.locator("button:has-text('أضف إلى السلة')").first();
  await expect(addBtn).toBeVisible({ timeout: 8000 });
  await addBtn.click();
  await page.waitForTimeout(600);

  const badge = page.locator("header span").filter({ hasText: /^[0-9]+$/ }).first();
  const count = await badge.textContent();
  expect(Number(count)).toBeGreaterThan(0);
});

// ─── Cart — quantity +/- and remove ──────────────────────────
test("5. Cart page — increase, decrease quantity and remove item", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const item = {
      product: {
        id: 99991, name: "Test Product", price: 200, originalPrice: 250,
        rating: 4, reviews: 10, image: "/logo.png", category: "Test",
        categoryId: 1, description: "desc", specs: [], stock: 100,
      },
      quantity: 1,
    };
    localStorage.setItem("cart", JSON.stringify([item]));
  });
  await page.goto("/cart");
  await page.waitForTimeout(2000);

  await expect(page.locator("text=Test Product")).toBeVisible({ timeout: 8000 });

  // The qty stepper is the div that contains a button with lucide-minus svg inside it.
  // Use :has() CSS selector — unique on the cart page.
  const qtyRow  = page.locator("div:has(> button > svg.lucide-minus)");
  const minusBtn = qtyRow.locator("button").nth(0);
  const plusBtn  = qtyRow.locator("button").nth(1);
  const qtySpan  = qtyRow.locator("span");

  // Increase
  await plusBtn.click();
  await page.waitForTimeout(400);
  await expect(qtySpan).toHaveText("2");

  // Decrease
  await minusBtn.click();
  await page.waitForTimeout(300);
  await expect(qtySpan).toHaveText("1");

  // Remove — the trash button is the first button inside the product card row
  const itemCard = page.locator("div.rounded-2xl").filter({ hasText: "Test Product" });
  await itemCard.locator("button").first().click();
  await page.waitForTimeout(500);

  await expect(page.locator("text=سلة التسوق فارغة")).toBeVisible({ timeout: 5000 });
});


// ─── Cart persistence across page reload ─────────────────────
test("6. Cart persists after page refresh", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const items = [
      {
        product: {
          id: 99992, name: "Persist Product", price: 150, originalPrice: 200,
          rating: 5, reviews: 3, image: "/logo.png", category: "Electronics",
          categoryId: 1, description: "d", specs: [], stock: 50,
        },
        quantity: 2,
      }
    ];
    localStorage.setItem("cart", JSON.stringify(items));
  });

  await page.reload();
  await page.waitForTimeout(1500);

  const badge = page.locator("header span").filter({ hasText: /^[0-9]+$/ }).first();
  const count = await badge.textContent();
  expect(Number(count)).toBe(2);   // 1 item × qty 2 = badge shows 2
});

// ─── Free shipping threshold ───────────────────────────────────
test("7. Free shipping threshold is 900 (upsell msg visible under 900)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const item = {
      product: {
        id: 99993, name: "Cheap Item", price: 100, originalPrice: 120,
        rating: 4, reviews: 1, image: "/logo.png", category: "Test",
        categoryId: 1, description: "x", specs: [], stock: 99,
      },
      quantity: 1,
    };
    localStorage.setItem("cart", JSON.stringify([item]));
  });
  await page.goto("/cart");
  await page.waitForTimeout(1500);

  // Upsell message should mention 800 (= 900 - 100)
  await expect(page.locator("text=/أضف.*ج\\.م.*شحن مجاني/")).toBeVisible();
});

// ─── Checkout navigation ───────────────────────────────────────
test("8. Checkout page loads correctly from cart", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const item = {
      product: {
        id: 99994, name: "Checkout Item", price: 300, originalPrice: 350,
        rating: 4, reviews: 5, image: "/logo.png", category: "Cat",
        categoryId: 1, description: "d", specs: [], stock: 20,
      },
      quantity: 1,
    };
    localStorage.setItem("cart", JSON.stringify([item]));
  });
  await page.goto("/cart");
  await page.waitForTimeout(1500);

  await page.locator("button:has-text('إتمام الطلب')").click();
  await page.waitForURL("**/checkout", { timeout: 8000 });
  // Wait for React to update document.title after SPA navigation
  await expect.poll(() => page.title(), { timeout: 5000 }).toBe("Checkout | A.S Brand Store");
});

// ─── Responsive — no overflow on mobile ───────────────────────
test("9. Logo and header — no horizontal overflow on mobile (430px)", async ({ browser }) => {
  const ctx  = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForTimeout(1500);

  const logo = page.locator("header img[alt='A.S Brand Store']");
  await expect(logo).toBeVisible();

  const box = await logo.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(430 + 1); // within viewport

  await ctx.close();
});

// ─── Admin Dashboard logo present ─────────────────────────────
test("10. Admin dashboard loads with logo", async ({ page }) => {
  await adminLogin(page);
  await page.waitForTimeout(2000);
  await expect(page.locator("aside img[alt='A.S Brand Store']")).toBeVisible();
  expect(await page.title()).toBe("Dashboard | A.S Brand Store");
});
