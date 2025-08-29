import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Log in as Super Admin
        page.goto("http://localhost:5173/login")
        page.get_by_label("Email").fill("superadmin@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to the dashboard
        expect(page).to_have_url(re.compile(r".*/dashboard"))
        page.screenshot(path="frontend/jules-scratch/verification/01_dashboard.png")

        # 2. Navigate to Session Management
        page.get_by_role("link", name="Session Management").click()
        expect(page).to_have_url(re.compile(r".*/dashboard/sessions"))

        # 3. Verify Session Management page
        expect(page.get_by_role("heading", name="Session Management")).to_be_visible()
        page.screenshot(path="frontend/jules-scratch/verification/02_session_management_page.png")

        # 4. Verify "Create Session" button and open modal
        create_button = page.get_by_role("button", name="Create Session")
        expect(create_button).to_be_visible()
        create_button.click()

        # 5. Verify the modal is open
        expect(page.get_by_role("heading", name="Create Session")).to_be_visible()
        page.screenshot(path="frontend/jules-scratch/verification/03_create_session_modal.png")

        print("Verification script ran successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="frontend/jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
