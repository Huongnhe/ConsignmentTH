from login_handler import LoginHandler
from consignment_handler import ConsignmentHandler
import mysql.connector
import os
from selenium import webdriver
from time import sleep

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
        
        # Khởi tạo WebDriver chung
        self.driver = webdriver.Chrome()
        
        # Khởi tạo các handler với driver chung
        self.login_handler = LoginHandler(self.driver)
        self.consignment_handler = ConsignmentHandler(self.driver)
        
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

    def run_test_cases(self):
        for account in self.accounts:
            print(f"\n=== Bắt đầu test với account: {account['email']} ({account['description']}) ===")
            
            # Thực hiện login
            login_success = self.login_handler.login(account)
            
            if not login_success:
                print(f"-> Đăng nhập thất bại, chuyển sang account tiếp theo")
                continue
            
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
                            create_success = self.consignment_handler.test_create_consignment(consignment_case)
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
                self.login_handler.logout()
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