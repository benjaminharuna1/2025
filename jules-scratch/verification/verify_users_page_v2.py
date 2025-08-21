from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to login page
        page.goto("http://localhost:5174/login", timeout=60000)

        #
        # PLEASE REPLACE THE PLACEHOLDER CREDENTIALS BELOW
        #
        # Fill in login form
        page.get_by_label("Email").fill("superadmin@test.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to dashboard
        expect(page).to_have_url("http://localhost:5174/dashboard", timeout=60000)

        # Navigate to users page
        page.goto("http://localhost:5174/dashboard/users")
        expect(page).to_have_url("http://localhost:5174/dashboard/users", timeout=60000)

        # Click "Add User" button
        page.get_by_role("button", name="Add User").click()

        # Fill out the form
        page.get_by_label("Name").fill("Test Student")
        page.get_by_label("Email").fill("test.student@example.com")
        page.get_by_label("Password").fill("password123")

        # Select Role
        page.get_by_role("button", name="Role").click()
        page.get_by_role("radio", name="Student").click()
        page.get_by_role("button", name="OK").click()

        # Select Gender
        page.get_by_role("button", name="Gender").click()
        page.get_by_role("radio", name="Male").click()
        page.get_by_role("button", name="OK").click()

        page.get_by_label("Phone Number").fill("1234567890")

        # Select Branch
        page.get_by_role("button", name="Branch").click()
        # This assumes there is at least one branch, and we select the first one.
        page.locator("ion-select-option").first.click()
        page.get_by_role("button", name="OK").click()

        # Select Class
        page.get_by_role("button", name="Class").click()
        # This assumes there is at least one class, and we select the first one.
        page.locator("ion-select-option").first.click()
        page.get_by_role("button", name="OK").click()

        page.get_by_label("Date of Birth").fill("2010-01-01")
        page.get_by_label("Admission Number").fill("STU-001")

        # Click Save
        page.get_by_role("button", name="Save").click()

        # Wait for the new user to appear in the list
        expect(page.locator("text=Test Student")).to_be_visible(timeout=60000)

        # Take screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Successfully created user and took a screenshot.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
