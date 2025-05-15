from login_handler import LoginHandler
from consignment_handler import ConsignmentHandler
from order_handler import OrderHandler
from registration_handler import RegistrationHandler
import mysql.connector
import os
from selenium import webdriver
from time import sleep

class ConsignmentTest:
    def __init__(self):
        # Khởi tạo kết nối database
        try:
            self.db = mysql.connector.connect(
                host="localhost",
                user="root",
                password="120804",
                database="ConsignmentTH"
            )
            self.cursor = self.db.cursor()
            print("[SYSTEM] Kết nối database thành công")
        except Exception as e:
            print(f"[SYSTEM ERROR] Lỗi kết nối database: {str(e)}")
            self.db = None
            self.cursor = None
        
        # Khởi tạo WebDriver chung
        try:
            self.driver = webdriver.Chrome()
            print("[SYSTEM] Khởi tạo WebDriver thành công")
        except Exception as e:
            print(f"[SYSTEM ERROR] Lỗi khởi tạo WebDriver: {str(e)}")
            self.driver = None
        
        # Khởi tạo các handler với driver chung
        if self.driver:
            self.login_handler = LoginHandler(self.driver)
            self.consignment_handler = ConsignmentHandler(self.driver)
            self.order_handler = OrderHandler(self.driver)
            self.registration_handler = RegistrationHandler(self.driver)
        else:
            self.login_handler = None
            self.consignment_handler = None
            self.order_handler = None
            self.registration_handler = None
        
        # Danh sách accounts
        self.accounts = [
            
            {
                "email": "wrong@gmail.com",
                "password": "wrongpass",
                "description": "User sai"
            },
            {
                "email": "",
                "password": "wrongpass",
                "description": "Email empty"
            },
            {
                "email": "cus@gmail.com",
                "password": "",
                "description": "Password empty"
            },
            {
                "email": "cus@gmail.com",
                "password": "12345",
                "description": "User đúng"
            },
            {
                "email": "admin@gmail.com", 
                "password": "123",
                "description": "admin"
            }
        ]
        
        # Danh sách test cases
        self.consignment_cases = [
            {
                "case_name": "Case 1 - Đầy đủ thông tin",
                "product_name": "Nike Air Force 1",
                "brand": "Nike",
                "product_type": "Shoes",
                "original_price": "1000000",
                "sale_price": "1800000",
                "quantity": "1",
                "image_path": os.path.abspath("test_images/hình ảnh.png")
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

        self.order_cases = [
            {
                "case_name": "Case 1 - Thêm đơn hàng hợp lệ",
                "product_name": "Adidas Ultraboost",
                "customer_name": "Nguyễn Văn A",
                "customer_phone": "0987654321",
                "customer_age": "30"
            },
            {
                "case_name": "Case 2 - Thêm đơn hàng không hợp lệ",
                "product_name": "Nike Air Force 1",
                "customer_name": "",
                "customer_phone": "",
                "customer_age": ""
            }
        ]

        self.search_cases = [
            {"order_id": 6, "description": "Đơn hàng hợp lệ"},
            {"order_id": 9999, "description": "Đơn hàng không tồn tại"}
        ]
        
        self.registration_test_cases = [
            {
                "case_name": "Đăng ký thành công với email hợp lệ",
                "username": "khanh",
                "email": "khanhhhadz@gmail.com",
                "password": "123",
                "email_address": "khanhhhadz@gmail.com",
                "email_password": "ahxtbsnpgkkhcfjp", 
                "expected_result": True,
                "description": "Kiểm tra đăng ký thành công với email hợp lệ và xác thực OTP thực"
            },
            {
                "case_name": "Đăng ký với email không hợp lệ",
                "username": "testuser_invalid",
                "email": "invalid_email",
                "password": "Valid@123",
                "expected_result": False,
                "expected_error": "Invalid email format",
                "description": "Kiểm tra hệ thống báo lỗi khi email không hợp lệ"
            },
            {
                "case_name": "Đăng ký với email đã tồn tại",
                "username": "testuser_exist",
                "email": "admin@gmail.com",
                "password": "Exist@123",
                "expected_result": False,
                "expected_error": "already exists",
                "description": "Kiểm tra hệ thống báo lỗi khi email đã tồn tại"
            }
        ]

        
        # Tạo thư mục test_images nếu chưa tồn tại
        os.makedirs("test_images", exist_ok=True)

    def run_test_cases(self):
        if not self.driver:
            print("[SYSTEM ERROR] Không thể chạy test do lỗi WebDriver")
            return
        
        #  Chạy các test case đăng ký
        print("\n=== Chạy các kiểm thử đăng ký ===")
        for case in self.registration_test_cases:
            print(f"\n=== Bắt đầu test case: {case['case_name']} ===")
            try:
                # Chạy test case đăng ký
                result = self.registration_handler.run_registration_test_case(case)
                print(f"-> [KẾT QUẢ] {'Thành công' if result else 'Thất bại'}")
                
                # Nếu test case thất bại nhưng không phải là lỗi hệ thống, vẫn chạy tiếp
                if not result and "SYSTEM ERROR" not in str(self.registration_handler.check_error_message()):
                    print("-> [INFO] Test case thất bại nhưng không phải lỗi hệ thống, tiếp tục chạy test case tiếp theo")
                    continue
                    
            except Exception as e:
                print(f"-> [LỖI HỆ THỐNG] Lỗi khi chạy test case: {str(e)}")
                # Tiếp tục chạy test case tiếp theo ngay cả khi có lỗi
                continue

        for account in self.accounts:
            print(f"\n=== Bắt đầu test với account: {account['email']} ({account['description']}) ===")
            
            # Thực hiện login
            login_success = False
            try:
                sleep(2)
                login_success = self.login_handler.login(account)
            except Exception as e:
                print(f"[SYSTEM ERROR] Lỗi khi đăng nhập: {str(e)}")
            
            if not login_success:
                print(f"-> [VALIDATE] Đăng nhập thất bại, chuyển sang account tiếp theo")
                continue
            
            # Kiểm tra role user
            email = account["email"]
            role = None
            if self.db and self.cursor:
                try:
                    self.cursor.execute("SELECT Account FROM TH_User WHERE Email = %s", (email,))
                    result = self.cursor.fetchone()
                    if result:
                        role = result[0]
                        print(f"-> [INFO] Role của user là: {role}")
                    else:
                        print("-> [VALIDATE] Không tìm thấy user trong database")
                except Exception as e:
                    print(f"-> [SYSTEM ERROR] Lỗi khi kiểm tra role: {str(e)}")
            
            if role:
                if role.lower() == "customer":
                    # Chạy các case create consignment
                    for consignment_case in self.consignment_cases:
                        try:
                            print(f"\n=== Thực hiện test case: {consignment_case['case_name']} ===")
                            create_success = self.consignment_handler.test_create_consignment(consignment_case)
                            print(f"-> [RESULT] {'Thành công' if create_success else 'Thất bại'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Lỗi khi chạy test case: {str(e)}")
                
                elif role.lower() == "manager":
                    # Chạy các case thêm đơn hàng
                    for order_case in self.order_cases:
                        try:
                            print(f"\n=== Thực hiện test case: {order_case['case_name']} ===")
                            add_success = self.order_handler.test_add_order(order_case)
                            print(f"-> [RESULT] {'Thành công' if add_success else 'Thất bại'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Lỗi khi chạy test case: {str(e)}")
                    
                    # Chạy các case tìm kiếm đơn hàng
                    for search_case in self.search_cases:
                        try:
                            print(f"\n=== Thực hiện tìm kiếm đơn hàng #{search_case['order_id']} ({search_case['description']}) ===")
                            search_success = self.order_handler.test_search_order(search_case["order_id"])
                            print(f"-> [RESULT] {'Thành công' if search_success else 'Thất bại'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Lỗi khi tìm kiếm đơn hàng: {str(e)}")
                else:
                    print(f"-> [VALIDATE] Role '{role}' không được hỗ trợ")
            
            # Logout sau khi test xong
            if login_success:
                try:
                    self.login_handler.logout()
                    sleep(2)
                except Exception as e:
                    print(f"-> [SYSTEM ERROR] Lỗi khi logout: {str(e)}")

    def cleanup(self):
        if self.driver:
            try:
                self.driver.quit()
                print("[SYSTEM] Đã đóng WebDriver")
            except Exception as e:
                print(f"[SYSTEM ERROR] Lỗi khi đóng WebDriver: {str(e)}")
        
        if self.cursor:
            try:
                self.cursor.close()
            except:
                pass
        
        if self.db:
            try:
                self.db.close()
            except:
                pass

if __name__ == "__main__":
    tester = ConsignmentTest()
    try:
        tester.run_test_cases()
    except Exception as e:
        print(f"[SYSTEM ERROR] Lỗi nghiêm trọng khi chạy test: {str(e)}")
    finally:
        tester.cleanup()