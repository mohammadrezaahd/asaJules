from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Register
    page.goto("http://localhost:3000/auth/register")
    page.get_by_label("First Name").fill("Admin")
    page.get_by_label("Last Name").fill("User")
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Email Address").fill("admin@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Sign Up").click()
    expect(page).to_have_url("http://localhost:3000/auth/login")

    # Login
    page.get_by_label("Email Address").fill("admin@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Sign In", exact=True).click()
    expect(page).to_have_url("http://localhost:3000/dashboard")

    # Go to new project page
    page.goto("http://localhost:3000/dashboard/projects/new")

    # Fill out form
    page.get_by_label("Project Title").fill("Test Project")
    page.get_by_label("Category").click()
    page.get_by_role("option", name="Architecture").click()
    page.get_by_label("Description").fill("This is a test project.")

    # Open media manager to select a model
    page.get_by_role("button", name="Select 3D Model").click()
    page.get_by_role("tab", name="Upload").click()
    page.locator('input[type="file"]').set_input_files("model.zip")
    page.get_by_role("button", name="Upload").click()
    page.get_by_role("tab", name="Library").click()
    page.locator(".MuiCard-root").first.click()
    page.get_by_role("button", name="Confirm").click()

    # Take screenshot
    page.screenshot(path="jules-scratch/verification/new_project_with_model.png")

    # # Create project
    # page.get_by_role("button", name="Create Project").click()
    # expect(page).to_have_url("http://localhost:3000/dashboard/projects")

    # # Go to edit page
    # page.get_by_role("link", name="Test Project").first.click()
    # page.get_by_role("button", name="edit").click()

    # # Take screenshot of edit page
    # page.screenshot(path="jules-scratch/verification/edit_project_with_model.png")

    browser.close()