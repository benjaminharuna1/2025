import re
import time
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Generate a unique email for registration
    unique_email = f"testuser_{int(time.time())}@example.com"
    password = "password123"

    try:
        # --- 1. Registration ---
        print("Navigating to registration page...")
        page.goto("http://localhost:5178/register", timeout=60000)

        # Wait for the registration form to be ready
        expect(page.get_by_role("heading", name="Create Account")).to_be_visible(timeout=10000)
        print("Registration page loaded.")

        # Fill out the registration form
        page.locator('ion-input[type="text"] input').fill("Test User")
        page.locator('ion-input[type="email"] input').fill(unique_email)
        page.locator('ion-input[type="password"] input').fill(password)

        # Click the register button
        page.get_by_role("button", name="Register").click()
        print("Registration form submitted.")

        # Wait for navigation to login page
        expect(page).to_have_url(re.compile(r".*/login"), timeout=15000)
        print("Redirected to login page.")

        # --- 2. Login ---
        # Fill out the login form with the new credentials
        page.locator('ion-input[type="email"] input').fill(unique_email)
        page.locator('ion-input[type="password"] input').fill(password)
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to the dashboard
        expect(page).to_have_url(re.compile(r".*/dashboard"), timeout=10000)
        print("Login successful.")

        # --- 3. Navigate to Results Page ---
        # The sidebar might take a moment to be clickable
        page.wait_for_selector("ion-menu-button", state="visible")
        page.get_by_role("button", name="Menu").click()
        page.get_by_role("link", name="Results").click()

        # --- 4. Verify Student/Parent View ---
        expect(page).to_have_url(re.compile(r".*/dashboard/results"), timeout=10000)
        # A parent user sees the "My Results" page
        expect(page.get_by_role("heading", name="My Results")).to_be_visible(timeout=10000)
        print("Navigated to Student/Parent Results Page.")

        # --- 5. Take Screenshot ---
        screenshot_path = "jules-scratch/verification/verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
