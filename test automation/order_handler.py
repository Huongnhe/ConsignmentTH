from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import os
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

class OrderHandler:
    def __init__(self, driver, download_dir=None):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 15)
        self.download_dir = download_dir or os.path.join(os.path.expanduser('~'), 'Downloads')
    
    def set_download_directory(self):
        """Set default download directory for browser"""
        if hasattr(self.driver, 'capabilities') and 'chrome' in self.driver.capabilities.get('browserName', '').lower():
            self.driver.command_executor._commands["send_command"] = (
                "POST", '/session/$sessionId/chromium/send_command')
            params = {
                'cmd': 'Page.setDownloadBehavior',
                'params': {
                    'behavior': 'allow',
                    'downloadPath': self.download_dir
                }
            }
            self.driver.execute("send_command", params)
    
    def test_add_order(self, order_case):
        print(f"\n=== Starting test case: {order_case['case_name']} ===")
        try:
            # Set download directory
            self.set_download_directory()
            
            # Navigate to order page
            self.driver.get("http://localhost:3000/admin/orders")
            sleep(3)
            
            # Verify admin page
            if "admin/orders" not in self.driver.current_url:
                print("-> [VALIDATE] Not an admin page, cannot add order")
                return False
            
            # Search for product
            search_input = self.wait.until(EC.presence_of_element_located(
                (By.XPATH, "//input[@placeholder='Enter product name...']")))
            search_input.clear()
            search_input.send_keys(order_case["product_name"])
            sleep(2)
            
            # Check if product appears in suggestions dropdown
            try:
                product_item = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, f"//li[contains(., '{order_case['product_name']}')]")))
                print(f"-> [INFO] Found product: {order_case['product_name']}")
                
                # Check product status (only "Received" can be added)
                try:
                    status_badge = product_item.find_element(By.XPATH, ".//span[contains(@class, 'badge')]")
                    if "bg-success" not in status_badge.get_attribute("class"):
                        print(f"-> [VALIDATE] Product not available (status not 'Received')")
                        return False
                except NoSuchElementException:
                    print("-> [VALIDATE] Could not determine product status")
                    return False
                
                # Click on product item to add to order
                product_item.click()
                sleep(2)
                
                # Verify product was added to selected products table
                try:
                    sleep(2)
                    self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, f"//table[contains(@class, 'table')]//td[contains(., '{order_case['product_name']}')]")))
                    print("-> [INFO] Product added to order")
                except TimeoutException:
                    print("-> [VALIDATE] Product not added to order")
                    return False
                
                # Fill customer info
                self._fill_customer_info(order_case)
                sleep(2)
                # Submit order
                submit_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Create Order')]")))
                submit_button.click()
                sleep(3)
                
                # Handle confirmation modal
                if not self._handle_confirmation_modal(order_case):
                    return False
                
                # Handle print invoice
                return self._handle_print_invoice(order_case)
                
            except (NoSuchElementException, TimeoutException):
                print(f"-> [VALIDATE] Product not found: {order_case['product_name']}")
                return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Error creating order: {str(e)}")
            return False
    
    def _fill_customer_info(self, order_case):
        """Fill customer information"""
        sleep(2)
        customer_name = self.wait.until(EC.presence_of_element_located(
            (By.XPATH, "//input[@name='name']")))
        customer_name.clear()
        customer_name.send_keys(order_case["customer_name"])
        sleep(2)
        
        customer_phone = self.driver.find_element(By.XPATH, "//input[@name='phone']")
        customer_phone.clear()
        customer_phone.send_keys(order_case["customer_phone"])
        sleep(2)
        
        customer_age = self.driver.find_element(By.XPATH, "//input[@name='age']")
        customer_age.clear()
        customer_age.send_keys(order_case["customer_age"])
        sleep(2)
        
        if "customer_address" in order_case:
            customer_address = self.driver.find_element(By.XPATH, "//input[@name='address']")
            customer_address.clear()
            customer_address.send_keys(order_case["customer_address"])
            sleep(2)
    
    def _handle_confirmation_modal(self, order_case):
        """Handle order confirmation modal"""
        try:
            sleep(2)
            # Wait for modal to appear
            modal = self.wait.until(EC.visibility_of_element_located(
                (By.XPATH, "//div[contains(@class, 'modal fade show d-block') and contains(., 'Confirm Order')]")))
            print("-> [INFO] Order confirmation modal appeared")
            
            # Verify modal content
            try:
                sleep(2)
                customer_name_in_modal = modal.find_element(By.XPATH, ".//div[contains(., 'Customer:')]")
                customer_phone_in_modal = modal.find_element(By.XPATH, ".//div[contains(., 'Phone:')]")
                product_in_modal = modal.find_element(By.XPATH, f".//li[contains(., '{order_case['product_name']}')]")
                print("-> [INFO] Order information displayed correctly in modal")
            except NoSuchElementException:
                print("-> [VALIDATE] Order information not displayed correctly in modal")
                return False
            
            # Click confirm button in modal
            confirm_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//div[@class='modal fade show d-block']//button[contains(., 'Confirm')]")))
            confirm_button.click()
            print("-> [INFO] Clicked confirm order in modal")
            sleep(3)
            
            # Check for success message
            try:
                success_alert = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//div[contains(@class, 'alert-success')]")))
                print(f"-> [SUCCESS] Order created successfully: {success_alert.text}")
                
                if "Order ID:" not in success_alert.text:
                    print("-> [VALIDATE] Success message but no order ID")
                    return False
                    
                return True
                
            except TimeoutException:
                # Check for error messages
                error_messages = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'alert-danger')]")
                if error_messages:
                    for error in error_messages:
                        print(f"-> [VALIDATE ERROR] {error.text}")
                else:
                    print("-> [VALIDATE] No success or specific error message after confirmation")
                return False
            
        except TimeoutException:
            print("-> [VALIDATE] Confirmation modal didn't appear after clicking create order")
            return False
    
    def _handle_print_invoice(self, order_case):
        """Handle print invoice confirmation"""
        try:
            sleep(2)
            print_modal = self.wait.until(EC.visibility_of_element_located(
                (By.XPATH, "//div[contains(@class, 'modal fade show d-block') and contains(., 'Print Invoice')]")))
            print("-> [INFO] Print invoice modal appeared")
            
            # Check print modal content
            try:
                sleep(2)
                modal_title = print_modal.find_element(By.XPATH, ".//h5[contains(., 'Print Invoice')]")
                modal_text = print_modal.find_element(By.XPATH, ".//p[contains(., 'Do you want to print the invoice')]")
                print("-> [INFO] Print invoice modal content displayed correctly")
            except NoSuchElementException:
                print("-> [VALIDATE] Print invoice modal content not displayed correctly")
                return False
            
            # Handle print confirmation based on test case setting
            if order_case.get("should_print", True):
                sleep(2)
                # Click print button
                print_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//div[contains(@class, 'modal fade show d-block')]//button[contains(., 'Print Invoice')]")))
                print_button.click()
                print("-> [INFO] Clicked print invoice")
                
                # Wait for print window to open
                sleep(3)
                
                # Handle print dialog (Chrome)
                if 'chrome' in self.driver.capabilities.get('browserName', '').lower():
                    try:
                        # Send keys to handle print dialog (Save as PDF)
                        actions = ActionChains(self.driver)
                        actions.send_keys(Keys.ENTER).perform()  # Confirm print
                        sleep(2)
                        
                        # Check if file was downloaded
                        print(f"-> [INFO] Invoice will be saved to: {self.download_dir}")
                    except Exception as e:
                        print(f"-> [WARNING] Couldn't handle print dialog: {str(e)}")
                
                return True
            else:
                sleep(2)
                # Click skip button
                skip_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//div[contains(@class, 'modal fade show d-block')]//button[contains(., 'Skip')]")))
                skip_button.click()
                print("-> [INFO] Clicked skip printing invoice")
                return True
                
        except TimeoutException:
            print("-> [VALIDATE] Print invoice modal didn't appear")
            return False
    
    def test_search_order(self, order_id):
        print(f"\n=== Starting order search: {order_id} ===")
        try:
            self.driver.get("http://localhost:3000/admin/orders")
            sleep(3)
            
            # Find search input
            order_id_input = self.wait.until(EC.presence_of_element_located(
                (By.XPATH, "//input[@placeholder='Enter order ID']")))
            order_id_input.clear()
            order_id_input.send_keys(str(order_id))
            
            # Click search button
            search_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'View Invoice')]")))
            search_button.click()
            sleep(3)
            
            # Check result
            try:
                # Check for error message if order not found
                error_alert = self.driver.find_element(By.XPATH, "//div[contains(@class, 'alert-danger')]")
                print(f"-> [VALIDATE] {error_alert.text}")
                return False
            except NoSuchElementException:
                # Check if redirected to order detail page
                if f"/admin/orders/{order_id}" in self.driver.current_url:
                    print(f"-> [SUCCESS] Found order #{order_id}")
                    return True
                else:
                    print(f"-> [VALIDATE] Couldn't find order #{order_id}")
                    return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Error searching for order: {str(e)}")
            return False