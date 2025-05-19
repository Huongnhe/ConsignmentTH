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
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']"))
            )
            username_field.clear()
            username_field.send_keys(username)
            sleep(1)

            email_field = self.driver.find_element(By.CSS_SELECTOR, "input[name='email']")
            email_field.clear()
            email_field.send_keys(email)
            sleep(1)

            password_field = self.driver.find_element(By.CSS_SELECTOR, "input[name='password']")
            password_field.clear()
            password_field.send_keys(password)
            sleep(1)
            return True
        except Exception as e:
            print(f"Error filling registration form: {str(e)}")
            return False

    def submit_registration_form(self):
        try:
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-testid='register-button']")))
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
                return None
            sleep(10)

        print("Failed to retrieve OTP within timeout period")
        return None
    
    def verify_otp_step(self, otp):
        try:
            # Đóng modal thông báo nếu có
            self.close_modal()
            sleep(1)

            # Chờ cho OTP input sẵn sàng
            otp_field = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[data-testid='otp-input']"))
            )
            
            # Chờ thêm để đảm bảo input có thể tương tác
            self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[data-testid='otp-input']")))
            
            # Xóa bất kỳ giá trị nào đã có trong trường OTP
            otp_field.clear()
            sleep(0.5)
            
            # Nhập OTP từng ký tự với delay
            for digit in otp:
                otp_field.send_keys(digit)
                sleep(0.2)
            
            sleep(0.5)

            # Click nút verify
            verify_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-testid='verify-button']"))
            )
            verify_button.click()
            
            # Chờ kết quả xác thực
            try:
                self.wait.until(lambda driver: (
                    EC.visibility_of_element_located((By.CSS_SELECTOR, "div[data-testid='alert-modal']"))(driver) or
                    "/login" in driver.current_url
                ))
                return True
            except TimeoutException:
                print("Timeout waiting for verification result")
                return False
                
        except Exception as e:
            print(f"Error in OTP verification step: {str(e)}")
            self.driver.save_screenshot("error_otp_verification.png")
            return False

    def verify_invalid_otp(self, otp):
        try:
            otp_field = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[data-testid='otp-input']"))
            )
            
            # Xóa trường OTP trước khi nhập
            otp_field.clear()
            sleep(0.5)
            
            # Nhập OTP từng ký tự với delay
            for digit in otp:
                otp_field.send_keys(digit)
                sleep(0.2)
            
            sleep(0.5)

            verify_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-testid='verify-button']"))
            )
            verify_button.click()
            
            try:
                error_modal = self.wait.until(
                    EC.visibility_of_element_located((By.CSS_SELECTOR, "div[data-testid='alert-modal']"))
                )
                if "error" in error_modal.text.lower():
                    print("Found error modal for invalid OTP as expected")
                    return True
                return False
            except TimeoutException:
                print("Error modal not found for invalid OTP")
                return False
                
        except Exception as e:
            print(f"Error in invalid OTP verification step: {str(e)}")
            self.driver.save_screenshot("error_invalid_otp_verification.png")
            return False

    def close_modal(self):
        try:
            modal = self.driver.find_elements(By.CSS_SELECTOR, "div[data-testid='alert-modal']")
            if modal:
                close_button = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-testid='close-modal-button']"))
                )
                close_button.click()
                sleep(1)
                return True
            return False
        except Exception:
            return False

    def run_registration_test_case(self, test_case):
        print(f"\n=== Starting test case: {test_case['case_name']} ===")
        result = False

        try:
            if not self.navigate_to_register_page():
                print("Failed at navigation step")
                return False

            if not self.fill_registration_form(test_case["username"], test_case["email"], test_case["password"]):
                print("Failed at form filling step")
                return False

            if not self.submit_registration_form():
                print("Failed at form submission step")
                return False

            if test_case["expected_result"]:
                try:
                    self.wait.until(
                        EC.text_to_be_present_in_element((By.TAG_NAME, "h2"), "OTP VERIFICATION"))
                    print("Reached OTP verification step")

                    if "@gmail.com" in test_case["email"] and "invalid" not in test_case["email"]:
                        if "otp" in test_case:
                            sleep(2)
                            otp = test_case["otp"]
                            print(f"Using OTP from test case: {otp}")
                        else:
                            sleep(2)
                            otp = self.get_otp_from_email(
                                test_case["email_address"],
                                test_case["email_password"]
                            )
                        
                        if not otp:
                            print("Failed to get OTP - marking test case as failed")
                            return False

                        result = self.verify_otp_step(otp)
                    else:
                        result = True
                except TimeoutException:
                    print("Failed to reach OTP verification step")
                    result = False
            else:
                try:
                    if "OTP" in test_case["case_name"]:
                        self.wait.until(
                            EC.text_to_be_present_in_element((By.TAG_NAME, "h2"), "OTP VERIFICATION"))
                        print("Reached OTP verification step")
                        
                        otp = test_case.get("otp", "123456")
                        result = self.verify_invalid_otp(otp)
                    else:
                        self.wait.until(
                            EC.visibility_of_element_located((By.CSS_SELECTOR, "div[data-testid='alert-modal']")))
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
            print(f"-> [RESULT] {'Success' if result else 'Failure'}")