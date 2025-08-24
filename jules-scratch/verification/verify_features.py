from playwright.sync_api import sync_playwright, Page, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Register a new user
    page.goto("http://localhost:5173/register")
    page.locator('input[type="text"]').fill("Test User")
    page.locator('input[type="email"]').fill("testuser@test.com")
    page.locator('input[type="password"]').fill("password")
    page.get_by_role("button", name="Register").click()

    # Wait for registration and redirection
    time.sleep(3)

    # Login with the new user
    page.goto("http://localhost:5173/login")
    page.locator('input[type="email"]').fill("testuser@test.com")
    page.locator('input[type="password"]').fill("password")
    page.get_by_role("button", name="Login").click()
    expect(page).to_have_url("http://localhost:5173/dashboard", timeout=10000)

    # Navigate to Fee Structures
    page.goto("http://localhost:5173/dashboard/feestructures")
    expect(page).to_have_url("http://localhost:5173/dashboard/feestructures")
    page.screenshot(path="jules-scratch/verification/fee_structures.png")

    # Navigate to Invoices
    page.goto("http://localhost:5173/dashboard/invoices")
    expect(page).to_have_url("http://localhost:5173/dashboard/invoices")
    page.screenshot(path="jules-scratch/verification/invoices.png")

    # Navigate to Fee Payments
    page.goto("http://localhost:5173/dashboard/feepayments")
    expect(page).to_have_url("http://localhost:5173/dashboard/feepayments")
    page.screenshot(path="jules-scratch/verification/fee_payments.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
