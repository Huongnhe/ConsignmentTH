from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import re
import imaplib
import email
import time
from email.header import decode_header

class RegistrationHandler:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 20)

    def navigate_to_register_page(self):
        try:
            self.driver.get("http://localhost:3000/register")
            sleep(2)
            return True
        except Exception as e:
            print(f"Error navigating to register page: {str(e)}")
            return False

    def fill_registration_form(self, username, email, password):
        try:
            username_field = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='username-input']"))
            )
            username_field.clear()
            username_field.send_keys(username)
            sleep(2)

            email_field = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='email-input']")
            email_field.clear()
            email_field.send_keys(email)
            sleep(2)

            password_field = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='password-input']")
            password_field.clear()
            password_field.send_keys(password)
            sleep(2)
            return True
        except Exception as e:
            print(f"Error filling registration form: {str(e)}")
            return False

    def submit_registration_form(self):
        try:
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='register-button']")))
            submit_button.click()
            sleep(3)
            return True
        except Exception as e:
            print(f"Error submitting registration form: {str(e)}")
            return False
    
    def get_otp_from_email(self, email_address, email_password, timeout=300):
        print(f"Retrieving OTP from email: {email_address}")
        start_time = time.time()
        otp = None

        while time.time() - start_time < timeout:
            try:
                mail = imaplib.IMAP4_SSL("imap.gmail.com")
                mail.login(email_address, email_password)
                mail.select("inbox")
                result, data = mail.search(None, "ALL")
                mail_ids = data[0].split()

                if mail_ids:
                    for mail_id in reversed(mail_ids):
                        result, data = mail.fetch(mail_id, "(RFC822)")
                        raw_email = data[0][1]
                        email_message = email.message_from_bytes(raw_email)
                        
                        subject = decode_header(email_message["Subject"])[0][0]
                        if isinstance(subject, bytes):
                            subject = subject.decode()

                        if "OTP" in subject or "verification code" in subject.lower():
                            if email_message.is_multipart():
                                for part in email_message.walk():
                                    if part.get_content_type() == "text/plain":
                                        body = part.get_payload(decode=True).decode()
                                        break
                            else:
                                body = email_message.get_payload(decode=True).decode()

                            otp_match = re.search(r"\b\d{6}\b", body)
                            if otp_match:
                                otp = otp_match.group(0)
                                print(f"Retrieved OTP: {otp}")
                                mail.close()
                                mail.logout()
                                return otp

                mail.close()
                mail.logout()
            except Exception as e:
                print(f"Error retrieving OTP from email: {str(e)}")

            sleep(10)

        return otp
    
    def verify_otp_step(self, otp):
        try:
            # Đảm bảo modal thông báo đã đóng
            self.close_modal()
            sleep(1)

            # Nhập OTP
            otp_field = self.wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='otp-input']"))
            )
            otp_field.clear()
            otp_field.send_keys(otp)
            sleep(0.5)

            # Click verify
            verify_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='verify-button']"))
            )
            verify_button.click()
            
            # Chờ modal thành công xuất hiện
            try:
                self.wait.until(
                    EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='alert-modal']"))
                )
                print("Found success modal after OTP verification")
                return True
            except TimeoutException:
                print("Success modal not found, but continuing...")
                return True
                
        except Exception as e:
            print(f"Error in OTP verification step: {str(e)}")
            self.driver.save_screenshot("error_otp_verification.png")
            return False

    def close_modal(self):
        try:
            # Kiểm tra xem modal có hiển thị không
            modal = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='alert-modal']"))
            )
            
            # Đóng modal nếu đang hiển thị
            close_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='close-modal-button']"))
            )
            close_button.click()
            sleep(1)
            return True
        except:
            return False

    def run_registration_test_case(self, test_case):
        print(f"\n=== Starting test case: {test_case['case_name']} ===")
        result = False

        try:
            # Bước 1: Điều hướng đến trang đăng ký
            if not self.navigate_to_register_page():
                print("Failed at navigation step")
                return False

            # Bước 2: Điền thông tin đăng ký
            if not self.fill_registration_form(test_case["username"], test_case["email"], test_case["password"]):
                print("Failed at form filling step")
                return False

            # Bước 3: Gửi form đăng ký
            if not self.submit_registration_form():
                print("Failed at form submission step")
                return False

            # Xử lý kết quả mong đợi
            if test_case["expected_result"]:
                try:
                    # Chờ chuyển sang bước OTP verification
                    self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//h2[contains(., 'OTP VERIFICATION')]")))
                    print("Reached OTP verification step")

                    # Xử lý OTP cho email hợp lệ
                    if "@gmail.com" in test_case["email"] and "invalid" not in test_case["email"]:
                        otp = self.get_otp_from_email(
                            test_case["email_address"],
                            test_case["email_password"]
                        )
                        if not otp:
                            print("Failed to retrieve OTP from email")
                            return False

                        if not self.verify_otp_step(otp):
                            print("Failed at OTP verification step")
                            return False

                        # Kiểm tra kết quả cuối cùng
                        try:
                            # Chờ modal thành công hoặc chuyển trang
                            self.wait.until(
                                lambda driver: (
                                    EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='alert-modal']"))(driver) or
                                    "/login" in driver.current_url
                                )
                            )
                            print("OTP verification successful")
                            result = True
                        except TimeoutException:
                            print("Timeout waiting for success confirmation")
                            result = False
                    else:
                        result = True
                except TimeoutException:
                    print("Failed to reach OTP verification step")
                    result = False
            else:
                # Xử lý trường hợp mong đợi lỗi
                try:
                    self.wait.until(
                        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='alert-modal']")))
                    print("Found error modal as expected")
                    result = True
                except TimeoutException:
                    print("Error modal not found when expected")
                    result = False

            return result
        except Exception as e:
            print(f"Error running test case: {str(e)}")
            self.driver.save_screenshot(f"error_{test_case['case_name'].replace(' ', '_')}.png")
            return False
        finally:
            print(f"Test case result: {'PASSED' if result else 'FAILED'}")
            print(f"-> [KẾT QUẢ] {'Thành công' if result else 'Thất bại'}")