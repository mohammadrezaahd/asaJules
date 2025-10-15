from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:3000/auth/login")
    page.get_by_label("Email Address").fill("admin@example.com")
    page.get_by_label("Password").fill("password123")
    page.get_by_role("button", name="Sign In", exact=True).click()
    page.wait_for_url("http://localhost:3000/dashboard")


    # Navigate to the admin projects page
    page.goto("http://localhost:3000/dashboard/projects")
    page.wait_for_load_state('networkidle')
    page.screenshot(path="jules-scratch/verification/admin_projects_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)