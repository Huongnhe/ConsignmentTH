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
        
        print(f"\nĐang đăng nhập với email: {email} ({description})")
        try:
            self.driver.get("http://localhost:3000/login")
            sleep(2)

            # Nhập email
            try:
                email_input = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
                email_input.clear()
                email_input.send_keys(email)
            except TimeoutException:
                print("-> [VALIDATE] Không tìm thấy trường email")
                return False
            
            # Nhập password
            try:
                password_input = self.wait.until(EC.presence_of_element_located((By.ID, "password")))
                password_input.clear()
                password_input.send_keys(password)
            except TimeoutException:
                print("-> [VALIDATE] Không tìm thấy trường password")
                return False
            
            # Click login button
            try:
                login_button = self.wait.until(EC.element_to_be_clickable((By.ID, "loginButton")))
                login_button.click()
                sleep(3)
            except TimeoutException:
                print("-> [VALIDATE] Không tìm thấy nút đăng nhập")
                return False
            
            # Xử lý alert nếu có (trường hợp đăng nhập sai)
            try:
                alert = self.driver.switch_to.alert
                alert_text = alert.text
                print(f"-> [VALIDATE] Xuất hiện alert: {alert_text}")
                alert.accept()
                sleep(3)
                return False
            except NoAlertPresentException:
                pass
            
            # Kiểm tra đăng nhập thành công
            if "home" or "admin" in self.driver.current_url:
                print("-> [SUCCESS] Đăng nhập thành công")
                sleep(2)
                return True
            else:
                print("-> [VALIDATE] Đăng nhập không thành công (không chuyển về trang home)")
                return False
            
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Lỗi hệ thống khi đăng nhập: {str(e)}")
            return False

    def logout(self):
        try:
            print("\n=== Đang thực hiện logout ===")
            self.driver.get("http://localhost:3000/home") 
            sleep(2)
            
            try:
                logout_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Logout')]")))
                logout_button.click()
                sleep(2)
                print("-> [SUCCESS] Đã logout thành công")
                return True
            except TimeoutException:
                print("-> [VALIDATE] Không tìm thấy nút logout")
                return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Lỗi hệ thống khi logout: {str(e)}")
            return False