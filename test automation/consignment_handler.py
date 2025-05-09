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
        print(f"\n=== Bắt đầu test case: {consignment_case['case_name']} ===")
        try:
            self.driver.get("http://localhost:3000/CreateConsign")
            sleep(3)
            
            # Kiểm tra xem có ở đúng trang CreateConsign không
            current_url = self.driver.current_url
            if "CreateConsign" not in current_url:
                print(f"-> [VALIDATE] KHÔNG ở trang CreateConsign, đang ở: {current_url}")
                return False
            
            # Kiểm tra tiêu đề trang
            try:
                self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//h3[contains(., 'New Consignment Request')]")))
            except TimeoutException:
                print("-> [VALIDATE] Không tìm thấy tiêu đề trang CreateConsign")
                return False
            
            # Điền thông tin sản phẩm
            try:
                product_name = self.wait.until(EC.presence_of_element_located((By.NAME, "Product_name")))
                product_name.clear()
                product_name.send_keys(consignment_case["product_name"])
                
                original_price = self.driver.find_element(By.NAME, "Original_price")
                original_price.clear()
                original_price.send_keys(consignment_case["original_price"])
                
                sale_price = self.driver.find_element(By.NAME, "Sale_price")
                sale_price.clear()
                sale_price.send_keys(consignment_case["sale_price"])
                
                brand_select = self.driver.find_element(By.NAME, "Brand_name")
                self.driver.execute_script("arguments[0].scrollIntoView(true);", brand_select)
                brand_select.click()
                sleep(1)
                self.driver.find_element(By.XPATH, f"//option[contains(., '{consignment_case['brand']}')]").click()
                
                type_select = self.driver.find_element(By.NAME, "Product_type_name")
                self.driver.execute_script("arguments[0].scrollIntoView(true);", type_select)
                type_select.click()
                sleep(1)
                self.driver.find_element(By.XPATH, f"//option[contains(., '{consignment_case['product_type']}')]").click()
                
                quantity = self.driver.find_element(By.NAME, "Quantity")
                self.driver.execute_script("arguments[0].scrollIntoView(true);", quantity)
                quantity.clear()
                quantity.send_keys(consignment_case["quantity"])
                
            except NoSuchElementException as e:
                print(f"-> [VALIDATE] Không tìm thấy trường nhập liệu: {str(e)}")
                return False
            
            # Upload ảnh
            image_path = consignment_case["image_path"]
            if not os.path.exists(image_path):
                from PIL import Image
                img = Image.new('RGB', (100, 100), color='red')
                img.save(image_path)
                print(f"-> [INFO] Đã tạo file ảnh mẫu tại: {image_path}")
            
            print(f"-> [INFO] Đang upload ảnh từ: {image_path}")
            try:
                image_input = self.driver.find_element(By.XPATH, "//input[@type='file']")
                self.driver.execute_script("arguments[0].style.display = 'block';", image_input)
                image_input.send_keys(image_path)
                sleep(2)
                
                try:
                    self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, "//img[contains(@src, 'blob:') or contains(@src, 'data:image')]")))
                    print("-> [INFO] Upload ảnh thành công")
                except TimeoutException:
                    print("-> [VALIDATE] Không xác nhận được ảnh đã upload")
            except NoSuchElementException:
                print("-> [VALIDATE] Không tìm thấy input upload ảnh")
                return False
            
            # Thêm sản phẩm
            try:
                add_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Add Product')]")))
                add_button.click()
                sleep(2)
                
                # Kiểm tra sản phẩm đã được thêm
                try:
                    product_table = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
                    rows = product_table.find_elements(By.TAG_NAME, "tr")
                    if len(rows) > 0:
                        print("-> [INFO] Đã thêm sản phẩm vào danh sách")
                    else:
                        print("-> [VALIDATE] Không thêm được sản phẩm vào danh sách")
                        return False
                except TimeoutException:
                    print("-> [VALIDATE] Không tìm thấy bảng sản phẩm")
                    return False
            except Exception as e:
                print(f"-> [VALIDATE] Lỗi khi thêm sản phẩm: {str(e)}")
                return False
            
            # Submit consignment
            try:
                submit_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Submit Consignment')]")))
                submit_button.click()
                sleep(3)
                
                # Kiểm tra kết quả
                try:
                    # Kiểm tra modal thành công
                    success_modal = self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, "//div[contains(@class, 'modal-content')]")))
                    print("-> [SUCCESS] Modal xác nhận thành công xuất hiện")
                    
                    ok_button = self.wait.until(EC.element_to_be_clickable(
                        (By.XPATH, "//button[contains(., 'OK')]")))
                    ok_button.click()
                    sleep(2)
                    
                    if "consigns" in self.driver.current_url:
                        print("-> [SUCCESS] Đã chuyển về trang Consigns")
                        return True
                    else:
                        print("-> [VALIDATE] Không chuyển về trang Consigns sau khi thành công")
                        return False
                    
                except TimeoutException:
                    # Kiểm tra thông báo lỗi
                    error_elements = self.driver.find_elements(By.XPATH, 
                        "//div[contains(@class, 'error') or contains(@class, 'invalid') or contains(@class, 'alert-danger')]")
                    if error_elements:
                        for error in error_elements:
                            print(f"-> [VALIDATE ERROR] {error.text}")
                    else:
                        print("-> [VALIDATE] Không có thông báo lỗi cụ thể")
                    
                    return False
                
            except Exception as e:
                print(f"-> [VALIDATE] Lỗi khi submit consignment: {str(e)}")
                return False
            
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Lỗi hệ thống khi tạo consignment: {str(e)}")
            return False