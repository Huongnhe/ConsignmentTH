from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from selenium.common.exceptions import NoSuchElementException, TimeoutException

class OrderHandler:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, 15)
    
    def test_add_order(self, order_case):
        print(f"\n=== Bắt đầu test case: {order_case['case_name']} ===")
        try:
            # Navigate to order page
            self.driver.get("http://localhost:3000/admin/orders")
            sleep(3)
            
            # Verify admin page
            if "admin/orders" not in self.driver.current_url:
                print("-> [VALIDATE] Không phải trang admin, không thể thực hiện thêm đơn")
                return False
            
            # Search for product
            search_input = self.wait.until(EC.presence_of_element_located(
                (By.XPATH, "//input[@placeholder='Nhập tên sản phẩm...']")))
            search_input.clear()
            search_input.send_keys(order_case["product_name"])
            sleep(2)
            
            # Check if product appears
            try:
                product_row = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, f"//td[contains(., '{order_case['product_name']}')]/..")))
                print(f"-> [INFO] Tìm thấy sản phẩm: {order_case['product_name']}")
                
                # Click add button
                add_button = product_row.find_element(By.XPATH, ".//button[contains(., 'Thêm')]")
                add_button.click()
                sleep(1)
                
                # Fill customer info
                customer_name = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//input[@name='name']")))
                customer_name.clear()
                customer_name.send_keys(order_case["customer_name"])
                
                customer_phone = self.driver.find_element(By.XPATH, "//input[@name='phone']")
                customer_phone.clear()
                customer_phone.send_keys(order_case["customer_phone"])
                
                customer_age = self.driver.find_element(By.XPATH, "//input[@name='age']")
                customer_age.clear()
                customer_age.send_keys(order_case["customer_age"])
                
                # Submit order
                submit_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Tạo đơn hàng')]")))
                submit_button.click()
                sleep(3)
                
                # Check for success or error messages
                try:
                    # Check for success message
                    success_alert = self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, "//div[contains(@class, 'alert-success')]")))
                    print(f"-> [SUCCESS] Tạo đơn thành công: {success_alert.text}")
                    return True
                except TimeoutException:
                    # Check for error messages
                    error_messages = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'error') or contains(@class, 'invalid') or contains(@class, 'alert-danger')]")
                    if error_messages:
                        for error in error_messages:
                            print(f"-> [VALIDATE ERROR] {error.text}")
                    else:
                        print("-> [VALIDATE] Không tìm thấy thông báo thành công hoặc lỗi cụ thể")
                    return False
                
            except (NoSuchElementException, TimeoutException):
                print(f"-> [VALIDATE] Không tìm thấy sản phẩm: {order_case['product_name']}")
                return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Lỗi hệ thống khi tạo đơn hàng: {str(e)}")
            return False
    
    def test_search_order(self, order_id):
        print(f"\n=== Bắt đầu tìm kiếm đơn hàng: {order_id} ===")
        try:
            self.driver.get("http://localhost:3000/admin/orders")
            sleep(3)
            
            # Find search input
            order_id_input = self.wait.until(EC.presence_of_element_located(
                (By.XPATH, "//input[@placeholder='Nhập ID đơn hàng']")))
            order_id_input.clear()
            order_id_input.send_keys(order_id)
            
            # Click search button
            search_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Xem hóa đơn')]")))
            search_button.click()
            sleep(3)
            
            # Check result
            try:
                # Check for error message if order not found
                error_alert = self.driver.find_element(By.XPATH, "//div[contains(@class, 'alert-danger')]")
                print(f"-> [VALIDATE] {error_alert.text}")
                return False
            except NoSuchElementException:
                # Check if order is displayed
                if str(order_id) in self.driver.page_source:
                    print(f"-> [SUCCESS] Tìm thấy đơn hàng #{order_id}")
                    return True
                else:
                    print(f"-> [VALIDATE] Không tìm thấy thông tin đơn hàng #{order_id}")
                    return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Lỗi hệ thống khi tìm kiếm đơn hàng: {str(e)}")
            return False