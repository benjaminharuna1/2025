from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5173/login", wait_until="domcontentloaded")

        email_input = page.locator('ion-input[type="email"] >> input')
        password_input = page.locator('ion-input[type="password"] >> input')

        expect(email_input).to_be_visible(timeout=10000)

        email_input.fill('superadmin@example.com')
        password_input.fill('password')

        page.click('ion-button[type="submit"]')

        expect(page).to_have_url("http://localhost:5173/dashboard", timeout=10000)

        # Open the sidebar menu
        menu_button = page.locator('ion-menu-button')
        expect(menu_button).to_be_visible()
        menu_button.click()

        sidebar = page.locator('ion-menu')
        expect(sidebar).to_be_visible()

        page.screenshot(path="jules-scratch/verification/verification.png")
    except Exception as e:
        print(f"An error occurred: {e}")
        # Capture a screenshot on error to help debug
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
