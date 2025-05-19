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
        # Initialize database connection
        try:
            self.db = mysql.connector.connect(
                host="localhost",
                user="root",
                password="120804",
                database="ConsignmentTH"
            )
            self.cursor = self.db.cursor()
            print("[SYSTEM] Database connection established successfully")
        except Exception as e:
            print(f"[SYSTEM ERROR] Database connection error: {str(e)}")
            self.db = None
            self.cursor = None
        
        # Initialize WebDriver
        try:
            self.driver = webdriver.Chrome()
            print("[SYSTEM] WebDriver initialized successfully")
        except Exception as e:
            print(f"[SYSTEM ERROR] WebDriver initialization error: {str(e)}")
            self.driver = None
        
        # Initialize handlers with shared driver
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
        
        # Accounts list
        self.accounts = [
            {
                "email": "wrong@gmail.com",
                "password": "wrongpass",
                "description": "Incorrect user"
            },
            {
                "email": "",
                "password": "wrongpass",
                "description": "Empty email"
            },
            {
                "email": "cus@gmail.com",
                "password": "",
                "description": "Empty password"
            },
            {
                "email": "cus@gmail.com",
                "password": "12345",
                "description": "Correct user"
            },
            {
                "email": "admin@gmail.com", 
                "password": "123",
                "description": "manager"
            }
        ]
        
        # Test cases list
        self.consignment_cases = [
            {
                "case_name": "Case 1 - Complete information",
                "product_name": "Nike Air Force 1",
                "brand": "Nike",
                "product_type": "Shoes",
                "original_price": "1000000",
                "sale_price": "1800000",
                "quantity": "1",
                "image_path": os.path.abspath("test_images/sample_image.png")
            },
            {
                "case_name": "Case 2 - Missing product name",
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
                "case_name": "Case 1 - Add valid order",
                "product_name": "Adidas Ultraboost",
                "customer_name": "Nguyen Van A",
                "customer_phone": "0987654321",
                "customer_age": "30",
                "should_print": False 
            },
            {
                "case_name": "Case 2 - Add invalid order",
                "product_name": "Nike Air Force 1",
                "customer_name": "",
                "customer_phone": "",
                "customer_age": "",
                "should_print": True 
            }
        ]

        self.search_cases = [
            {"order_id": 6, "description": "Valid order"},
            {"order_id": 9999, "description": "Non-existent order"}
        ]
        
        self.registration_test_cases = [
            # {
            #     "case_name": "Incorrect OTP verification",
            #     "username": "testuser",
            #     "email": "khanhhhadz@gmail.com",
            #     "password": "Valid@123",
            #     "email_address": "dthuhuong133@gmail.com",
            #     "email_password": "uqljpuvwdcclunua",
            #     "otp": "999999",
            #     "expected_result": False,
            #     "description": "Check system error when entering wrong OTP"
            # },
            {
                "case_name": "Successful registration with valid email",
                "username": "khanh",
                "email": "dthuhuong133@gmail.com",
                "password": "123",
                "email_address": "dthuhuong133@gmail.com",  
                "email_password": "bdscqmbivcaianhk", 
                "expected_result": True,
                "description": "Check successful registration with valid email and real OTP verification"
            },
            {
                "case_name": "Registration with invalid email",
                "username": "testuser_invalid",
                "email": "invalid_email",
                "password": "Valid@123",
                "expected_result": False,
                "expected_error": "Invalid email format",
                "description": "Check system error when email is invalid"
            },
            {
                "case_name": "Registration with existing email",
                "username": "testuser_exist",
                "email": "admin@gmail.com",
                "password": "Exist@123",
                "expected_result": False,
                "expected_error": "already exists",
                "description": "Check system error when email already exists"
            }
        ]

        # Test results statistics
        self.test_results = {
            'registration': {'success': 0, 'fail': 0},
            'login': {'success': 0, 'fail': 0},
            'consignment': {'success': 0, 'fail': 0},
            'order': {'success': 0, 'fail': 0},
            'search': {'success': 0, 'fail': 0}
        }
        
        # Create test_images directory if not exists
        os.makedirs("test_images", exist_ok=True)

    def run_test_cases(self):
        if not self.driver:
            print("[SYSTEM ERROR] Cannot run tests due to WebDriver error")
            return
        
        # Run registration test cases
        print("\n=== Running registration tests ===")
        for case in self.registration_test_cases:
            print(f"\n=== Starting test case: {case['case_name']} ===")
            try:
                result = self.registration_handler.run_registration_test_case(case)
                if result:
                    self.test_results['registration']['success'] += 1
                else:
                    self.test_results['registration']['fail'] += 1
                print(f"-> [RESULT] {'Success' if result else 'Failure'}")
            except Exception as e:
                print(f"-> [SYSTEM ERROR] Error running test case: {str(e)}")
                self.test_results['registration']['fail'] += 1

        for account in self.accounts:
            print(f"\n=== Starting test with account: {account['email']} ({account['description']}) ===")
            
            # Perform login
            login_success = False
            try:
                sleep(2)
                login_success = self.login_handler.login(account)
                if login_success:
                    self.test_results['login']['success'] += 1
                else:
                    self.test_results['login']['fail'] += 1
            except Exception as e:
                print(f"[SYSTEM ERROR] Login error: {str(e)}")
                self.test_results['login']['fail'] += 1
            
            if not login_success:
                print(f"-> [VALIDATE] Login failed, moving to next account")
                continue
            
            # Check user role
            email = account["email"]
            role = None
            if self.db and self.cursor:
                try:
                    self.cursor.execute("SELECT Account FROM TH_User WHERE Email = %s", (email,))
                    result = self.cursor.fetchone()
                    if result:
                        role = result[0]
                        print(f"-> [INFO] User role is: {role}")
                    else:
                        print("-> [VALIDATE] User not found in database")
                except Exception as e:
                    print(f"-> [SYSTEM ERROR] Error checking role: {str(e)}")
            
            if role:
                if role.lower() == "customer":
                    # Run create consignment cases
                    for consignment_case in self.consignment_cases:
                        try:
                            print(f"\n=== Running test case: {consignment_case['case_name']} ===")
                            create_success = self.consignment_handler.test_create_consignment(consignment_case)
                            if create_success:
                                self.test_results['consignment']['success'] += 1
                            else:
                                self.test_results['consignment']['fail'] += 1
                            print(f"-> [RESULT] {'Success' if create_success else 'Failure'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Error running test case: {str(e)}")
                            self.test_results['consignment']['fail'] += 1
                
                elif role.lower() == "manager":
                    # Run add order cases
                    for order_case in self.order_cases:
                        try:
                            print(f"\n=== Running test case: {order_case['case_name']} ===")
                            add_success = self.order_handler.test_add_order(order_case)
                            if add_success:
                                self.test_results['order']['success'] += 1
                            else:
                                self.test_results['order']['fail'] += 1
                            print(f"-> [RESULT] {'Success' if add_success else 'Failure'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Error running test case: {str(e)}")
                            self.test_results['order']['fail'] += 1
                    
                    # Run order search cases
                    for search_case in self.search_cases:
                        try:
                            print(f"\n=== Searching for order #{search_case['order_id']} ({search_case['description']}) ===")
                            search_success = self.order_handler.test_search_order(search_case["order_id"])
                            if search_success:
                                self.test_results['search']['success'] += 1
                            else:
                                self.test_results['search']['fail'] += 1
                            print(f"-> [RESULT] {'Success' if search_success else 'Failure'}")
                        except Exception as e:
                            print(f"-> [SYSTEM ERROR] Error searching for order: {str(e)}")
                            self.test_results['search']['fail'] += 1
                else:
                    print(f"-> [VALIDATE] Role '{role}' not supported")
            
            # Logout after testing
            if login_success:
                try:
                    self.login_handler.logout()
                    sleep(2)
                except Exception as e:
                    print(f"-> [SYSTEM ERROR] Logout error: {str(e)}")

        # Show test summary
        self.show_test_summary()

    def show_test_summary(self):
        print("\n=== TEST RESULTS SUMMARY ===")
        print(f"1. Registration: Success {self.test_results['registration']['success']}, Fail {self.test_results['registration']['fail']}")
        print(f"2. Login: Success {self.test_results['login']['success']}, Fail {self.test_results['login']['fail']}")
        print(f"3. Create consignment: Success {self.test_results['consignment']['success']}, Fail {self.test_results['consignment']['fail']}")
        print(f"4. Add order: Success {self.test_results['order']['success']}, Fail {self.test_results['order']['fail']}")
        print(f"5. Search order: Success {self.test_results['search']['success']}, Fail {self.test_results['search']['fail']}")
        
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
        
        print(f"\nTOTAL: {total_success} test cases passed, {total_fail} test cases failed")

    def cleanup(self):
        if self.driver:
            try:
                self.driver.quit()
                print("[SYSTEM] WebDriver closed")
            except Exception as e:
                print(f"[SYSTEM ERROR] Error closing WebDriver: {str(e)}")
        
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
        print(f"[SYSTEM ERROR] Critical error running tests: {str(e)}")
    finally:
        tester.cleanup()