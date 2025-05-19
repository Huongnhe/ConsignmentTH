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
        """Thiết lập thư mục download mặc định cho trình duyệt"""
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
        print(f"\n=== Bắt đầu test case: {order_case['case_name']} ===")
        try:
            # Thiết lập thư mục download
            self.set_download_directory()
            
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
                self._fill_customer_info(order_case)
                
                # Submit order
                submit_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'Tạo đơn hàng')]")))
                submit_button.click()
                sleep(3)
                
                # Handle confirmation modal
                if not self._handle_confirmation_modal(order_case):
                    return False
                
                # Handle print invoice
                return self._handle_print_invoice(order_case)
                
            except (NoSuchElementException, TimeoutException):
                print(f"-> [VALIDATE] Không tìm thấy sản phẩm: {order_case['product_name']}")
                return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Lỗi hệ thống khi tạo đơn hàng: {str(e)}")
            return False
    
    def _fill_customer_info(self, order_case):
        """Điền thông tin khách hàng"""
        customer_name = self.wait.until(EC.presence_of_element_located(
            (By.XPATH, "//input[@name='name']")))
        customer_name.clear()
        customer_name.send_keys(order_case["customer_name"])
        sleep(1)
        
        customer_phone = self.driver.find_element(By.XPATH, "//input[@name='phone']")
        customer_phone.clear()
        customer_phone.send_keys(order_case["customer_phone"])
        sleep(1)
        
        customer_age = self.driver.find_element(By.XPATH, "//input[@name='age']")
        customer_age.clear()
        customer_age.send_keys(order_case["customer_age"])
        sleep(1)
        
        if "customer_address" in order_case:
            customer_address = self.driver.find_element(By.XPATH, "//input[@name='address']")
            customer_address.clear()
            customer_address.send_keys(order_case["customer_address"])
            sleep(1)
    
    def _handle_confirmation_modal(self, order_case):
        """Xử lý modal xác nhận đơn hàng"""
        try:
            # Wait for modal to appear
            modal = self.wait.until(EC.visibility_of_element_located(
                (By.XPATH, "//div[contains(@class, 'modal fade show d-block') and contains(., 'Xác nhận đơn hàng')]")))
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
            
            # Click confirm button in modal
            confirm_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//div[@class='modal fade show d-block']//button[contains(., 'Xác nhận')]")))
            confirm_button.click()
            print("-> [INFO] Đã bấm xác nhận đơn hàng trong modal")
            sleep(3)
            
            # Check for success message
            try:
                success_alert = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//div[contains(@class, 'alert-success')]")))
                print(f"-> [SUCCESS] Tạo đơn thành công: {success_alert.text}")
                
                if "Mã đơn hàng:" not in success_alert.text:
                    print("-> [VALIDATE] Thông báo thành công nhưng không có mã đơn hàng")
                    return False
                    
                return True
                
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
    
    def _handle_print_invoice(self, order_case):
        """Xử lý in hóa đơn"""
        try:
            print_modal = self.wait.until(EC.visibility_of_element_located(
                (By.XPATH, "//div[contains(@class, 'modal fade show d-block') and contains(., 'In hóa đơn')]")))
            print("-> [INFO] Modal xác nhận in hóa đơn xuất hiện")
            
            # Check print modal content
            try:
                modal_title = print_modal.find_element(By.XPATH, ".//h5[contains(., 'In hóa đơn')]")
                modal_text = print_modal.find_element(By.XPATH, ".//p[contains(., 'Bạn có muốn in hóa đơn')]")
                print("-> [INFO] Nội dung modal in hóa đơn hiển thị chính xác")
            except NoSuchElementException:
                print("-> [VALIDATE] Nội dung modal in hóa đơn không hiển thị đúng")
                return False
            
            # Handle print confirmation based on test case setting
            if order_case.get("should_print", True):
                # Click print button
                print_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//div[contains(@class, 'modal fade show d-block')]//button[contains(., 'In hóa đơn')]")))
                print_button.click()
                print("-> [INFO] Đã bấm in hóa đơn")
                
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
                        # Note: You may need to implement file existence check in download directory
                        print(f"-> [INFO] Hóa đơn sẽ được lưu vào: {self.download_dir}")
                    except Exception as e:
                        print(f"-> [WARNING] Không thể xử lý dialog in: {str(e)}")
                
                return True
            else:
                # Click skip button
                skip_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//div[contains(@class, 'modal fade show d-block')]//button[contains(., 'Bỏ qua')]")))
                skip_button.click()
                print("-> [INFO] Đã bấm bỏ qua in hóa đơn")
                return True
                
        except TimeoutException:
            print("-> [VALIDATE] Modal xác nhận in hóa đơn không xuất hiện")
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
                # Check if redirected to order detail page
                if f"/admin/orders/{order_id}" in self.driver.current_url:
                    print(f"-> [SUCCESS] Tìm thấy đơn hàng #{order_id}")
                    return True
                else:
                    print(f"-> [VALIDATE] Không tìm thấy thông tin đơn hàng #{order_id}")
                    return False
                
        except Exception as e:
            print(f"-> [SYSTEM ERROR] Lỗi hệ thống khi tìm kiếm đơn hàng: {str(e)}")
            return False