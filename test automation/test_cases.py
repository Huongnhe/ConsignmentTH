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
                "description": "manager"
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
                "customer_age": "30",
                "should_print": False 
            },
            {
                "case_name": "Case 2 - Thêm đơn hàng không hợp lệ",
                "product_name": "Nike Air Force 1",
                "customer_name": "",
                "customer_phone": "",
                "customer_age": "",
                "should_print": True 
            }
        ]

        self.search_cases = [
            {"order_id": 6, "description": "Đơn hàng hợp lệ"},
            {"order_id": 9999, "description": "Đơn hàng không tồn tại"}
        ]
        
        self.registration_test_cases = [
            {
                "case_name": "Xác thực OTP sai",
                "username": "testuser",
                "email": "khanhhhadz@gmail.com",
                "password": "Valid@123",
                "email_address": "khanhhhadz@gmail.com",
                "email_password": "ahxtbsnpgkkhcfjp",
                "otp": "999999",
                "expected_result": False,
                "description": "Kiểm tra hệ thống báo lỗi khi nhập OTP sai"
            },
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

        # Thống kê kết quả test
        self.test_results = {
            'registration': {'success': 0, 'fail': 0},
            'login': {'success': 0, 'fail': 0},
            'consignment': {'success': 0, 'fail': 0},
            'order': {'success': 0, 'fail': 0},
            'search': {'success': 0, 'fail': 0}
        }
        
        # Tạo thư mục test_images nếu chưa tồn tại
        os.makedirs("test_images", exist_ok=True)

    def run_test_cases(self):
        if not self.driver:
            print("[SYSTEM ERROR] Không thể chạy test do lỗi WebDriver")
            return
        
        # Chạy các test case đăng ký
        print("\n=== Chạy các kiểm thử đăng ký ===")
        for case in self.registration_test_cases:
            print(f"\n=== Bắt đầu test case: {case['case_name']} ===")
            try:
                result = self.registration_handler.run_registration_test_case(case)
                if result:
                    self.test_results['registration']['success'] += 1
                else:
                    self.test_results['registration']['fail'] += 1
                print(f"-> [KẾT QUẢ] {'Thành công' if result else 'Thất bại'}")
            except Exception as e:
                print(f"-> [LỖI HỆ THỐNG] Lỗi khi chạy test case: {str(e)}")
                self.test_results['registration']['fail'] += 1

        for account in self.accounts:
            print(f"\n=== Bắt đầu test với account: {account['email']} ({account['description']}) ===")
            
            # Thực hiện login
            login_success = False
            try:
                sleep(2)
                login_success = self.login_handler.login(account)
                if login_success:
                    self.test_results['login']['success'] += 1
                else:
                    self.test_results['login']['fail'] += 1
            except Exception as e:
                print(f"[SYSTEM ERROR] Lỗi khi đăng nhập: {str(e)}")
                self.test_results['login']['fail'] += 1
            
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
                            if create_success:
                                self.test_results['consignment']['success'] += 1
                            else:
                                self.test_results['consignment']['fail'] += 1
                            print(f"-> [RESULT] {'Thành công' if create_success else 'Thất bại'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Lỗi khi chạy test case: {str(e)}")
                            self.test_results['consignment']['fail'] += 1
                
                elif role.lower() == "manager":
                    # Chạy các case thêm đơn hàng
                    for order_case in self.order_cases:
                        try:
                            print(f"\n=== Thực hiện test case: {order_case['case_name']} ===")
                            add_success = self.order_handler.test_add_order(order_case)
                            if add_success:
                                self.test_results['order']['success'] += 1
                            else:
                                self.test_results['order']['fail'] += 1
                            print(f"-> [RESULT] {'Thành công' if add_success else 'Thất bại'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Lỗi khi chạy test case: {str(e)}")
                            self.test_results['order']['fail'] += 1
                    
                    # Chạy các case tìm kiếm đơn hàng
                    for search_case in self.search_cases:
                        try:
                            print(f"\n=== Thực hiện tìm kiếm đơn hàng #{search_case['order_id']} ({search_case['description']}) ===")
                            search_success = self.order_handler.test_search_order(search_case["order_id"])
                            if search_success:
                                self.test_results['search']['success'] += 1
                            else:
                                self.test_results['search']['fail'] += 1
                            print(f"-> [RESULT] {'Thành công' if search_success else 'Thất bại'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Lỗi khi tìm kiếm đơn hàng: {str(e)}")
                            self.test_results['search']['fail'] += 1
                else:
                    print(f"-> [VALIDATE] Role '{role}' không được hỗ trợ")
            
            # Logout sau khi test xong
            if login_success:
                try:
                    self.login_handler.logout()
                    sleep(2)
                except Exception as e:
                    print(f"-> [SYSTEM ERROR] Lỗi khi logout: {str(e)}")

        # Hiển thị tổng kết kết quả test
        self.show_test_summary()

    def show_test_summary(self):
        print("\n=== TỔNG KẾT KẾT QUẢ KIỂM THỬ ===")
        print(f"1. Đăng ký: Thành công {self.test_results['registration']['success']}, Thất bại {self.test_results['registration']['fail']}")
        print(f"2. Đăng nhập: Thành công {self.test_results['login']['success']}, Thất bại {self.test_results['login']['fail']}")
        print(f"3. Tạo lô hàng: Thành công {self.test_results['consignment']['success']}, Thất bại {self.test_results['consignment']['fail']}")
        print(f"4. Thêm đơn hàng: Thành công {self.test_results['order']['success']}, Thất bại {self.test_results['order']['fail']}")
        print(f"5. Tìm kiếm đơn hàng: Thành công {self.test_results['search']['success']}, Thất bại {self.test_results['search']['fail']}")
        
        total_success = (self.test_results['registration']['success'] + 
                        self.test_results['login']['success'] + 
                        self.test_results['consignment']['success'] + 
                        self.test_results['order']['success'] + 
                        self.test_results['search']['success'])
        
        total_fail = (self.test_results['registration']['fail'] + 
                      self.test_results['login']['fail'] + 
                      self.test_results['consignment']['fail'] + 
                      self.test_results['order']['fail'] + 
                      self.test_results['search']['fail'])
        
        print(f"\nTỔNG CỘNG: {total_success} test case thành công, {total_fail} test case thất bại")

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