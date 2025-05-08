from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from selenium.common.exceptions import NoAlertPresentException

class LoginHandler:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 15)
        
    def login(self, login_info):
        email = login_info["email"]
        password = login_info["password"]
        description = login_info["description"]
        
        print(f"\nĐang đăng nhập với email: {email} ({description})")
        try:
            self.driver.get("http://localhost:3000/login")
            sleep(2)

            email_input = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            email_input.clear()
            email_input.send_keys(email)
            
            password_input = self.wait.until(EC.presence_of_element_located((By.ID, "password")))
            password_input.clear()
            password_input.send_keys(password)
            
            login_button = self.wait.until(EC.element_to_be_clickable((By.ID, "loginButton")))
            login_button.click()
            sleep(3)
            
            # Xử lý alert nếu có (trường hợp đăng nhập sai)
            try:
                alert = self.driver.switch_to.alert
                print(f"-> Xuất hiện alert: {alert.text}")
                alert.accept()
                sleep(3)
                return False
            except NoAlertPresentException:
                pass
            
            # Kiểm tra nếu đăng nhập thành công
            if "home" in self.driver.current_url:
                print("-> Đăng nhập thành công")
                sleep(2)
                return True
            else:
                print("-> Đăng nhập không thành công (không chuyển về trang home)")
                return False
            
        except Exception as e:
            print(f"-> Đăng nhập thất bại: {str(e)}")
            return False

    def logout(self):
        try:
            print("\n=== Đang thực hiện logout ===")
            self.driver.get("http://localhost:3000/home") 
            sleep(2)
            logout_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Logout')]")))
            logout_button.click()
            sleep(2)
            print("-> Đã logout thành công")
            return True
        except Exception as e:
            print(f"-> Lỗi khi logout: {str(e)}")
            return False