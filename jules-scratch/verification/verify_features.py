from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login first
    page.goto("http://localhost:5173/login")
    page.locator('input[type="email"]').fill("superadmin@test.com")
    page.locator('input[type="password"]').fill("password")
    page.get_by_role("button", name="Login").click()
    expect(page).to_have_url("http://localhost:5173/dashboard", timeout=10000)

    # Navigate to Invoices page
    page.goto("http://localhost:5173/dashboard/invoices")
    expect(page).to_have_url("http://localhost:5173/dashboard/invoices")
    page.screenshot(path="jules-scratch/verification/invoices_page_with_new_features.png")

    # Open the Generate Invoices modal and take a screenshot
    page.get_by_role("button", name="Generate Invoices").click()
    expect(page.get_by_text("Generate Invoices in Bulk")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/generate_invoices_modal.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
