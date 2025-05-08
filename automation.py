import mysql.connector
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import os
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoAlertPresentException

class ConsignmentTest:
    def __init__(self):
        # Khởi tạo kết nối database
        self.db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="120804",
            database="ConsignmentTH"
        )
        self.cursor = self.db.cursor()
        
        # Khởi tạo WebDriver
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 15)
        self.actions = ActionChains(self.driver)
        
        # Danh sách accounts
        self.accounts = [
            {
                "email": "cus@example.com",
                "password": "12345",
                "description": "User đúng"
            },
            {
                "email": "wrong@example.com",
                "password": "wrongpass",
                "description": "User sai"
            },
            {
                "email": "admin@example.com", 
                "password": "123",
                "description": "admin"
            }
        ]
        
        # Danh sách tất cả các case create consignment
        self.consignment_cases = [
            {
                "case_name": "Case 1 - Đầy đủ thông tin",
                "product_name": "Nike Air Force 1",
                "brand": "Nike",
                "product_type": "Shoes",
                "original_price": "1000000",
                "sale_price": "1800000",
                "quantity": "1",
                "image_path": os.path.abspath("test_images/product1.png")
            },
            {
                "case_name": "Case 2 - Thiếu tên sản phẩm",
                "product_name": "",
                "brand": "Nike",
                "product_type": "Shoes",
                "original_price": "1000000",
                "sale_price": "800000",
                "quantity": "1",
                "image_path": os.path.abspath("test_images/product2.png")
            }
        ]

        # Tạo thư mục test_images nếu chưa tồn tại
        os.makedirs("test_images", exist_ok=True)

    def login(self, login_info):
        email = login_info["email"]
        password = login_info["password"]
        description = login_info["description"]
        
        print(f"\nĐang đăng nhập với email: {email} ({description})")
        try:
            self.driver.get("http://localhost:3000/login")
            sleep(2)

            email_input = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
            email_input.clear()
            email_input.send_keys(email)
            
            password_input = self.wait.until(EC.presence_of_element_located((By.ID, "password")))
            password_input.clear()
            password_input.send_keys(password)
            
            login_button = self.wait.until(EC.element_to_be_clickable((By.ID, "loginButton")))
            login_button.click()
            sleep(3)
            
            # Xử lý alert nếu có (trường hợp đăng nhập sai)
            try:
                alert = self.driver.switch_to.alert
                print(f"-> Xuất hiện alert: {alert.text}")
                alert.accept()
                sleep(3)
                return False
            except NoAlertPresentException:
                pass
            
            # Kiểm tra nếu đăng nhập thành công
            if "home" in self.driver.current_url:
                print("-> Đăng nhập thành công")
                sleep(2)
                return True
            else:
                print("-> Đăng nhập không thành công (không chuyển về trang home)")
                return False
            
        except Exception as e:
            print(f"-> Đăng nhập thất bại: {str(e)}")
            return False

    def test_create_consignment(self, consignment_case):
        print(f"\n=== Bắt đầu test case: {consignment_case['case_name']} ===")
        try:
            self.driver.get("http://localhost:3000/CreateConsign")
            sleep(3)
            
            # Kiểm tra xem có ở đúng trang CreateConsign không
            current_url = self.driver.current_url
            if "CreateConsign" not in current_url:
                print(f"-> KHÔNG ở trang CreateConsign, đang ở: {current_url}")
                self.driver.get("http://localhost:3000/CreateConsign")
                sleep(3)
            
            self.wait.until(EC.presence_of_element_located(
                (By.XPATH, "//h3[contains(., 'New Consignment Request')]")))
            
            # Điền thông tin sản phẩm
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
            
            # Upload ảnh
            image_path = consignment_case["image_path"]
            if not os.path.exists(image_path):
                from PIL import Image
                img = Image.new('RGB', (100, 100), color='red')
                img.save(image_path)
                print(f"-> Đã tạo file ảnh mẫu tại: {image_path}")
            
            print(f"-> Đang upload ảnh từ: {image_path}")
            image_input = self.driver.find_element(By.XPATH, "//input[@type='file']")
            self.driver.execute_script("arguments[0].style.display = 'block';", image_input)
            image_input.send_keys(image_path)
            sleep(2)
            
            try:
                self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//img[contains(@src, 'blob:') or contains(@src, 'data:image')]")))
                print("-> Upload ảnh thành công")
            except:
                print("-> Không xác nhận được ảnh đã upload")
            
            add_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Add Product')]")))
            
            try:
                add_button.click()
            except:
                print("-> Thử click bằng JavaScript do bị intercept")
                self.driver.execute_script("arguments[0].click();", add_button)
            sleep(2)
            
            product_table = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
            rows = product_table.find_elements(By.TAG_NAME, "tr")
            assert len(rows) == 1
            print("-> Đã thêm sản phẩm vào danh sách")
            
            submit_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Submit Consignment')]")))
            
            try:
                submit_button.click()
            except:
                print("-> Thử click bằng JavaScript do bị intercept")
                self.driver.execute_script("arguments[0].click();", submit_button)
            sleep(3)
            
            # Xử lý kết quả
            try:
                # Kiểm tra nếu có modal thành công
                success_modal = self.wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//div[contains(@class, 'modal-content')]")))
                print("-> Modal xác nhận thành công xuất hiện")
                
                ok_button = self.wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'OK')]")))
                try:
                    ok_button.click()
                except:
                    print("-> Thử click OK bằng JavaScript")
                    self.driver.execute_script("arguments[0].click();", ok_button)
                sleep(2)
                
                self.wait.until(EC.url_contains("/consigns"))
                print("-> Đã chuyển về trang Consigns (thành công)")
                
            except Exception as e:
                print(f"-> Không có modal thành công: {str(e)}")
                
                # Kiểm tra nếu có thông báo lỗi
                try:
                    error_elements = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'error') or contains(@class, 'invalid')]")
                    if error_elements:
                        print(f"-> Phát hiện lỗi: {len(error_elements)} thông báo lỗi")
                except:
                    print("-> Không phát hiện được thông báo lỗi cụ thể")
                
                # Kiểm tra URL hiện tại
                current_url = self.driver.current_url
                print(f"-> URL hiện tại: {current_url}")
                
                # Nếu không ở trang consigns thì chuyển về
                if "consigns" not in current_url:
                    self.driver.get("http://localhost:3000/consigns")
                    sleep(2)
                    print("-> Đã chuyển về trang Consigns (sau khi thất bại)")
                
                # Sau 3 giây chuyển lại trang CreateConsign để test tiếp
                sleep(3)
                self.driver.get("http://localhost:3000/CreateConsign")
                print("-> Đã chuyển lại trang CreateConsign sau 3 giây")
                sleep(2)
            
            return True
            
        except Exception as e:
            print(f"-> Lỗi khi tạo consignment: {str(e)}")
            self.driver.save_screenshot(f"error_consignment_{consignment_case.get('case_name', 'unknown')}.png")
            
            # Kiểm tra URL hiện tại
            current_url = self.driver.current_url
            print(f"-> URL hiện tại khi xảy ra lỗi: {current_url}")
            
            # Nếu không ở trang consigns thì chuyển về
            if "consigns" not in current_url:
                self.driver.get("http://localhost:3000/consigns")
                sleep(2)
                print("-> Đã chuyển về trang Consigns")
            
            # Sau 3 giây chuyển lại trang CreateConsign để test tiếp
            sleep(3)
            self.driver.get("http://localhost:3000/CreateConsign")
            print("-> Đã chuyển lại trang CreateConsign sau 3 giây")
            sleep(2)
            
            return False

    def logout(self):
        try:
            print("\n=== Đang thực hiện logout ===")
            self.driver.get("http://localhost:3000/home") 
            sleep(2)
            logout_button = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Logout')]")))
            logout_button.click()
            sleep(2)
            print("-> Đã logout thành công")
            return True
        except Exception as e:
            print(f"-> Lỗi khi logout: {str(e)}")
            return False

    def run_test_cases(self):
        for account in self.accounts:
            print(f"\n=== Bắt đầu test với account: {account['email']} ({account['description']}) ===")
            
            # Thực hiện login
            login_success = self.login(account)
            
            if not login_success:
                print(f"-> Đăng nhập thất bại, chuyển sang account tiếp theo")
                continue  # Bỏ qua account này và chuyển sang account tiếp theo
            
            # Kiểm tra role user
            email = account["email"]
            try:
                self.cursor.execute("SELECT Account FROM TH_User WHERE Email = %s", (email,))
                result = self.cursor.fetchone()
                if result:
                    role = result[0]
                    print(f"-> Role của user là: {role}")
                    
                    if role.lower() == "customer":
                        # Chạy tất cả các case create consignment cho account này
                        for consignment_case in self.consignment_cases:
                            create_success = self.test_create_consignment(consignment_case)
                            if not create_success:
                                print(f"-> Test case {consignment_case['case_name']} thất bại")
                    else:
                        print(f"-> Không phải customer, bỏ qua các case create consignment")
                else:
                    print("-> Không tìm thấy user trong database")
            except Exception as e:
                print(f"-> Lỗi khi kiểm tra role: {str(e)}")
            
            # Logout sau khi test xong tất cả case cho account này
            if login_success:
                self.logout()
                sleep(2)

    def cleanup(self):
        self.driver.quit()
        self.cursor.close()
        self.db.close()

if __name__ == "__main__":
    tester = ConsignmentTest()
    try:
        tester.run_test_cases()
    finally:
        tester.cleanup()