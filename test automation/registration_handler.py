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
        self.wait = WebDriverWait(self.driver, 15)

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

            email_field = self.driver.find_element(By.CSS_SELECTOR, "input[name='email']")
            email_field.clear()
            email_field.send_keys(email)

            password_field = self.driver.find_element(By.CSS_SELECTOR, "input[name='password']")
            password_field.clear()
            password_field.send_keys(password)
            return True
        except Exception as e:
            print(f"Error filling registration form: {str(e)}")
            return False

    def submit_registration_form(self):
        try:
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
            submit_button.click()
            sleep(2)
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
                    # Search from newest to oldest
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
            self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//h2[contains(., 'OTP VERIFICATION')]"))
            )
            otp_field = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input#otp"))
            )
            otp_field.clear()
            otp_field.send_keys(otp)

            verify_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'VERIFY OTP')]"))
            )
            verify_button.click()
            sleep(3)
            return True
        except Exception as e:
            print(f"Error in OTP verification step: {str(e)}")
            return False

    def close_modal(self):
        try:
            close_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "div.modal.show .btn-close")))
            close_button.click()
            sleep(1)
            return True
        except Exception as e:
            print(f"Error closing modal: {str(e)}")
            return False

    def check_success_message(self, expected_message=None):
        try:
            # Wait for modal to appear
            modal = self.wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "div.modal.show[data-testid='alert-modal']"))
            )
            
            # Check modal header
            header = modal.find_element(By.CSS_SELECTOR, "h5.modal-title")
            if "Success" not in header.text:
                raise Exception("Modal is not a success type")
                
            # Get message content
            message = modal.find_element(By.CSS_SELECTOR, "div.modal-body").text
            print(f"Success message: {message}")
            
            # Check if expected message matches
            if expected_message and expected_message not in message:
                print(f"Message content doesn't match. Expected: {expected_message}")
                return False
                
            # Close the modal
            self.close_modal()
            return True
            
        except Exception as e:
            print(f"Error checking success message: {str(e)}")
            self.driver.save_screenshot("error_success_modal_not_found.png")
            return False

    def check_error_message(self, expected_error=None):
        try:
            # Wait for error modal
            modal = self.wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "div.modal.show[data-testid='alert-modal']")))
            
            # Check modal header
            header = modal.find_element(By.CSS_SELECTOR, "h5.modal-title")
            if "Error" not in header.text:
                raise Exception("Modal is not an error type")
                
            # Get error content
            error_text = modal.find_element(By.CSS_SELECTOR, "div.modal-body").text
            print(f"Error message: {error_text}")

            # Check if expected error matches
            if expected_error and expected_error not in error_text:
                print(f"Error content doesn't match. Expected: {expected_error}")
                return None
                
            # Close the modal
            self.close_modal()
            return error_text
            
        except Exception as e:
            print(f"Error checking error message: {str(e)}")
            self.driver.save_screenshot("error_modal_not_found.png")
            return None

    def run_registration_test_case(self, test_case):
        print(f"\n=== Starting test case: {test_case['case_name']} ===")
        result = False

        try:
            # Step 1: Navigate to register page
            if not self.navigate_to_register_page():
                return False

            # Step 2: Fill registration form
            if not self.fill_registration_form(test_case["username"], test_case["email"], test_case["password"]):
                return False

            # Step 3: Submit registration form
            if not self.submit_registration_form():
                return False

            # Step 4: Check expected result
            if test_case["expected_result"]:
                # Expect success - should proceed to OTP step
                try:
                    self.wait.until(
                        EC.presence_of_element_located((By.XPATH, "//h2[contains(., 'OTP VERIFICATION')]")))
                    print("Reached OTP verification step")

                    # For valid email cases, proceed with OTP verification
                    if "@gmail.com" in test_case["email"] and "invalid" not in test_case["email"]:
                        otp = self.get_otp_from_email(
                            test_case["email_address"],
                            test_case["email_password"]
                        )
                        if not otp:
                            print("Failed to retrieve OTP from email")
                            return False

                        if not self.verify_otp_step(otp):
                            return False

                        # Check final success message
                        result = self.check_success_message(
                            test_case.get("expected_success_message")
                        )
                    else:
                        result = True
                except TimeoutException:
                    print("Failed to reach OTP verification step")
                    return False
            else:
                # Expect error - should show error modal
                error_text = self.check_error_message(
                    test_case.get("expected_error")
                )
                result = error_text is not None

            return result
        except Exception as e:
            print(f"Error running test case: {str(e)}")
            self.driver.save_screenshot(f"error_{test_case['case_name'].replace(' ', '_')}.png")
            return False
        finally:
            print(f"Result: {'Success' if result else 'Failed'}")