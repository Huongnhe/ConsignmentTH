from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import os
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException, TimeoutException

class ConsignmentHandler:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 15)
        self.actions = ActionChains(self.driver)
    
    def test_create_consignment(self, consignment_case):
        print(f"\n=== Starting test case: {consignment_case['case_name']} ===")
        try:
            self.driver.get("http://localhost:3000/CreateConsign")
            sleep(3)
            
            # Check if on correct CreateConsign page
            current_url = self.driver.current_url
            if "CreateConsign" not in current_url:
                print(f"-> [VALIDATE] NOT on CreateConsign page, currently at: {current_url}")
                return False
            
            # Check page title
            try:
                self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//h3[contains(., 'New Consignment Request')]")))
            except TimeoutException:
                print("-> [VALIDATE] CreateConsign page title not found")
                return False
            
            # Fill product information
            try:
                product_name = self.wait.until(EC.presence_of_element_located((By.NAME, "Product_name")))
                product_name.clear()
                product_name.send_keys(consignment_case["product_name"])
                sleep(2)

                original_price = self.driver.find_element(By.NAME, "Original_price")
                original_price.clear()
                original_price.send_keys(consignment_case["original_price"])
                sleep(2)

                sale_price = self.driver.find_element(By.NAME, "Sale_price")
                sale_price.clear()
                sale_price.send_keys(consignment_case["sale_price"])
                sleep(2)

                brand_select = self.driver.find_element(By.NAME, "Brand_name")
                self.driver.execute_script("arguments[0].scrollIntoView(true);", brand_select)
                brand_select.click()
                sleep(2)

                self.driver.find_element(By.XPATH, f"//option[contains(., '{consignment_case['brand']}')]").click()
                
                type_select = self.driver.find_element(By.NAME, "Product_type_name")
                self.driver.execute_script("arguments[0].scrollIntoView(true);", type_select)
                type_select.click()
                sleep(2)
                self.driver.find_element(By.XPATH, f"//option[contains(., '{consignment_case['product_type']}')]").click()
                
                quantity = self.driver.find_element(By.NAME, "Quantity")
                self.driver.execute_script("arguments[0].scrollIntoView(true);", quantity)
                quantity.clear()
                quantity.send_keys(consignment_case["quantity"])
                sleep(2)

            except NoSuchElementException as e:
                print(f"-> [VALIDATE] Input field not found: {str(e)}")
                return False
            
            # Upload image
            image_path = consignment_case["image_path"]
            if not os.path.exists(image_path):
                from PIL import Image
                img = Image.new('RGB', (100, 100), color='red')
                img.save(image_path)
                print(f"-> [INFO] Created sample image file at: {image_path}")
                
            print(f"-> [INFO] Uploading image from: {image_path}")
            try:
                image_input = self.driver.find_element(By.XPATH, "//input[@type='file']")
                self.driver.execute_script("arguments[0].style.display = 'block';", image_input)
                image_input.send_keys(image_path)
                sleep(2)
                
                try:
                    self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, "//img[contains(@src, 'blob:') or contains(@src, 'data:image')]")))
                    sleep(2)
                    print("-> [INFO] Image uploaded successfully")
                except TimeoutException:
                    print("-> [VALIDATE] Could not confirm image upload")
            except NoSuchElementException:
                print("-> [VALIDATE] Image upload input not found")
                return False
            
            # Add product
            try:
                add_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Add Product')]")))
                add_button.click()
                sleep(2)
                
                # Check if product was added
                try:
                    product_table = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
                    rows = product_table.find_elements(By.TAG_NAME, "tr")
                    if len(rows) > 0:
                        print("-> [INFO] Product added to list")
                    else:
                        print("-> [VALIDATE] Failed to add product to list")
                        return False
                except TimeoutException:
                    print("-> [VALIDATE] Product table not found")
                    return False
            except Exception as e:
                print(f"-> [VALIDATE] Error adding product: {str(e)}")
                return False
            
            # Submit consignment
            try:
                submit_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Submit Consignment')]")))
                submit_button.click()
                sleep(3)
                
                # Check result
                try:
                    # Check success modal
                    success_modal = self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, "//div[contains(@class, 'modal-content')]")))
                    print("-> [SUCCESS] Success confirmation modal appeared")
                    
                    ok_button = self.wait.until(EC.element_to_be_clickable(
                        (By.XPATH, "//button[contains(., 'OK')]")))
                    ok_button.click()
                    sleep(2)
                    
                    if "consigns" in self.driver.current_url:
                        print("-> [SUCCESS] Redirected to Consigns page")
                        return True
                    else:
                        print("-> [VALIDATE] Not redirected to Consigns page after success")
                        return False
                    
                except TimeoutException:
                    # Check error messages
                    error_elements = self.driver.find_elements(By.XPATH, 
                        "//div[contains(@class, 'error') or contains(@class, 'invalid') or contains(@class, 'alert-danger')]")
                    if error_elements:
                        for error in error_elements:
                            print(f"-> [VALIDATE ERROR] {error.text}")
                    else:
                        print("-> [VALIDATE] No specific error message")
                    
                    return False
                
            except Exception as e:
                print(f"-> [VALIDATE] Error submitting consignment: {str(e)}")
                return False
            
        except Exception as e:
            print(f"-> [SYSTEM ERROR] System error creating consignment: {str(e)}")
            return False