from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from selenium.common.exceptions import NoAlertPresentException, TimeoutException, NoSuchElementException

class LoginHandler:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 15)
        
    def login(self, login_info):
        email = login_info["email"]
        password = login_info["password"]
        description = login_info["description"]
        
        print(f"\nLogging in with email: {email} ({description})")
        try:
            self.driver.get("http://localhost:3000/login")
            sleep(2)

            # Enter email
            try:
                email_input = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
                email_input.clear()
                email_input.send_keys(email)
                sleep(1)
            except TimeoutException:
                print("-> [VALIDATE] Email field not found")
                return False
            
            # Enter password
            try:
                password_input = self.wait.until(EC.presence_of_element_located((By.ID, "password")))
                password_input.clear()
                password_input.send_keys(password)
                sleep(1)
            except TimeoutException:
                print("-> [VALIDATE] Password field not found")
                return False
            
            # Click login button
            try:
                login_button = self.wait.until(EC.element_to_be_clickable((By.ID, "loginButton")))
                login_button.click()
                sleep(3)
            except TimeoutException:
                print("-> [VALIDATE] Login button not found")
                return False
            
            
           # Check login success
            current_url = self.driver.current_url
            if "home" in current_url or "admin" in current_url:
                print("-> [SUCCESS] Login successful")
                sleep(2)
                return True
            else:
                print("-> [VALIDATE] Login failed (not redirected to home/admin page)")
                return False

            
        except Exception as e:
            print(f"-> [SYSTEM ERROR] System error during login: {str(e)}")
            return False

    def logout(self):
        try:
            print("\n=== Performing logout ===")
            self.driver.get("http://localhost:3000/home") 
            sleep(2)
            
            try:
                logout_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Logout')]")))
                logout_button.click()
                sleep(2)
                print("-> [SUCCESS] Logout successful")
                return True
            except TimeoutException:
                print("-> [VALIDATE] Logout button not found")
                return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] System error during logout: {str(e)}")
            return False