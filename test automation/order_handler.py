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
            
            # Check if product appears in suggestions dropdown
            try:
                product_item = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, f"//li[contains(., '{order_case['product_name']}')]")))
                print(f"-> [INFO] Tìm thấy sản phẩm: {order_case['product_name']}")
                sleep(2)
                # Check product status (only "Received" can be added)
                try:
                    status_badge = product_item.find_element(By.XPATH, ".//span[contains(@class, 'badge')]")
                    if "bg-success" not in status_badge.get_attribute("class"):
                        print(f"-> [VALIDATE] Sản phẩm không có sẵn (status không phải 'Received')")
                        return False
                except NoSuchElementException:
                    print("-> [VALIDATE] Không xác định được trạng thái sản phẩm")
                    return False
                
                # Click on product item to add to order
                product_item.click()
                sleep(1)
                
                # Verify product was added to selected products table
                try:
                    self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, f"//table[contains(@class, 'table')]//td[contains(., '{order_case['product_name']}')]")))
                    print("-> [INFO] Sản phẩm đã được thêm vào đơn hàng")
                except TimeoutException:
                    print("-> [VALIDATE] Sản phẩm không được thêm vào đơn hàng")
                    return False
                
                # Fill customer info
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
                # Submit order
                submit_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Tạo đơn hàng')]")))
                submit_button.click()
                sleep(3)
                
                # Handle confirmation modal
                try:
                    # Wait for modal to appear
                    modal = self.wait.until(EC.visibility_of_element_located(
                        (By.XPATH, "//div[contains(@class, 'modal fade show d-block')]")))
                    print("-> [INFO] Modal xác nhận đơn hàng xuất hiện")
                    
                    # Verify modal content
                    try:
                        customer_name_in_modal = modal.find_element(By.XPATH, ".//div[contains(., 'Khách hàng:')]")
                        customer_phone_in_modal = modal.find_element(By.XPATH, ".//div[contains(., 'Số điện thoại:')]")
                        product_in_modal = modal.find_element(By.XPATH, f".//li[contains(., '{order_case['product_name']}')]")
                        print("-> [INFO] Thông tin đơn hàng hiển thị chính xác trong modal")
                    except NoSuchElementException:
                        print("-> [VALIDATE] Thông tin đơn hàng không hiển thị đúng trong modal")
                        return False
                    sleep(2)
                    # Click confirm button in modal
                    confirm_button = self.wait.until(EC.element_to_be_clickable(
                        (By.XPATH, "//div[@class='modal fade show d-block']//button[contains(., 'Xác nhận')]")))
                    confirm_button.click()
                    print("-> [INFO] Đã bấm xác nhận đơn hàng trong modal")
                    sleep(3)
                    
                    # Check for success or error messages after confirmation
                    try:
                        # Check for success message
                        success_alert = self.wait.until(EC.presence_of_element_located(
                            (By.XPATH, "//div[contains(@class, 'alert-success')]")))
                        print(f"-> [SUCCESS] Tạo đơn thành công: {success_alert.text}")
                        
                        # Check if order ID is displayed in success message
                        if "Mã đơn hàng:" in success_alert.text:
                            return True
                        else:
                            print("-> [VALIDATE] Thông báo thành công nhưng không có mã đơn hàng")
                            return False
                            
                    except TimeoutException:
                        # Check for error messages
                        error_messages = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'alert-danger')]")
                        if error_messages:
                            for error in error_messages:
                                print(f"-> [VALIDATE ERROR] {error.text}")
                        else:
                            print("-> [VALIDATE] Không tìm thấy thông báo thành công hoặc lỗi cụ thể sau khi xác nhận")
                        return False
                    
                except TimeoutException:
                    print("-> [VALIDATE] Modal xác nhận không xuất hiện sau khi bấm tạo đơn")
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
            order_id_input.send_keys(str(order_id))
            
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