# registration_handler.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from selenium.common.exceptions import TimeoutException
import re
import imaplib
import email
import time
from email.header import decode_header

class RegistrationHandler:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 15)

    def navigate_to_register_page(self):
        try:
            self.driver.get("http://localhost:3000/register")
            sleep(2)
            return True
        except Exception as e:
            print(f"-> [LỖI HỆ THỐNG] Lỗi khi điều hướng đến trang đăng ký: {str(e)}")
            return False

    def fill_registration_form(self, username, email, password):
        try:
            time.sleep(2)
            username_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']")))
            username_field.clear()
            username_field.send_keys(username)
            time.sleep(2)
            email_field = self.driver.find_element(By.CSS_SELECTOR, "input[name='email']")
            email_field.clear()
            email_field.send_keys(email)
            time.sleep(2)
            password_field = self.driver.find_element(By.CSS_SELECTOR, "input[name='password']")
            password_field.clear()
            password_field.send_keys(password)

            return True
        except Exception as e:
            print(f"-> [KIỂM TRA] Lỗi khi điền form đăng ký: {str(e)}")
            return False

    def submit_registration_form(self):
        try:
            submit_button = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
            submit_button.click()
            sleep(2)
            return True
        except Exception as e:
            print(f"-> [KIỂM TRA] Lỗi khi gửi form đăng ký: {str(e)}")
            return False

    def get_otp_from_email(self, email_address, email_password, timeout=300):
        print(f"-> [INFO] Đang lấy OTP từ email: {email_address}")
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
                    latest_email_id = mail_ids[-1]
                    result, data = mail.fetch(latest_email_id, "(RFC822)")
                    raw_email = data[0][1]
                    email_message = email.message_from_bytes(raw_email)
                    subject = decode_header(email_message["Subject"])[0][0]
                    if isinstance(subject, bytes):
                        subject = subject.decode()

                    if "OTP" in subject or "mã xác thực" in subject:
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
                            print(f"-> [INFO] Đã lấy được OTP: {otp}")
                            break

                mail.close()
                mail.logout()
            except Exception as e:
                print(f"-> [WARNING] Lỗi khi lấy OTP từ email: {str(e)}")

            sleep(10)

        return otp

    def verify_otp_step(self, otp):
        try:
            time.sleep(2)
            self.wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(., 'OTP VERIFICATION')]")))
            otp_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#otp")))
            otp_field.clear()
            otp_field.send_keys(otp)

            verify_button = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'VERIFY OTP')]")))
            verify_button.click()
            sleep(3)

            return True
        except Exception as e:
            print(f"-> [KIỂM TRA] Lỗi ở bước xác thực OTP: {str(e)}")
            return False

    def check_success_message(self):
        try:
            # Kiểm tra toast success
            toast = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'toast') and contains(@class, 'show')]//div[contains(@class, 'bg-success')]"))
            )
            toast_message = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'toast-body')]"))
            ).text
            print(f"-> [THÀNH CÔNG] Thông báo đăng ký thành công: {toast_message}")
            return True
        except TimeoutException:
            print("-> [KIỂM TRA] Không tìm thấy thông báo thành công sau khi đăng ký")
            return False

    def check_error_message(self, expected_error=None):
        try:
            # Kiểm tra toast error
            toast = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'toast') and contains(@class, 'show')]//div[contains(@class, 'bg-danger')]"))
            )
            error_text = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'toast-body')]"))
            ).text
            print(f"-> [LỖI KIỂM TRA] Thông báo lỗi: {error_text}")

            if expected_error and expected_error not in error_text:
                print(f"-> [KIỂM TRA] Không tìm thấy thông báo lỗi mong muốn: {expected_error}")
                return False

            return error_text
        except TimeoutException:
            print("-> [KIỂM TRA] Không tìm thấy thông báo lỗi")
            return None

    def run_registration_test_case(self, test_case):
        print(f"\n=== Bắt đầu test case: {test_case['case_name']} ===")
        print(f"-> Mô tả: {test_case['description']}")
        result = False

        try:
            if not self.navigate_to_register_page():
                return False

            if not self.fill_registration_form(test_case["username"], test_case["email"], test_case["password"]):
                return False

            if not self.submit_registration_form():
                return False

            if test_case["expected_result"]:
                try:
                    self.wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(., 'OTP VERIFICATION')]")))
                    print("-> [INFO] Đã đến bước xác thực OTP")

                    if "@gmail.com" in test_case["email"] and "invalid" not in test_case["email"]:
                        otp = self.get_otp_from_email(
                            test_case["email_address"],
                            test_case["email_password"]
                        )
                        if not otp:
                            print("-> [KIỂM TRA] Không lấy được OTP từ email")
                            return False

                        if not self.verify_otp_step(otp):
                            return False

                        result = self.check_success_message()
                    else:
                        result = True
                except TimeoutException:
                    print("-> [KIỂM TRA] Không thể đến bước xác thực OTP")
                    return False
            else:
                error_text = self.check_error_message()
                result = error_text is not None
                if "expected_error" in test_case:
                    result = result and (test_case["expected_error"] in error_text)

            return result
        except Exception as e:
            print(f"-> [LỖI HỆ THỐNG] Lỗi khi chạy test case: {str(e)}")
            return False
        finally:
            print(f"-> [KẾT QUẢ] {'Thành công' if result else 'Thất bại'}")