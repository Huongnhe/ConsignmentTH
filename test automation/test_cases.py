from login_handler import LoginHandler
from consignment_handler import ConsignmentHandler
from order_handler import OrderHandler
from registration_handler import RegistrationHandler
import mysql.connector
import os
from selenium import webdriver
from time import sleep
import openpyxl
from datetime import datetime

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

        # Enhanced test results tracking
        self.test_results = {
            'registration': {'cases': [], 'success': 0, 'fail': 0},
            'login': {'cases': [], 'success': 0, 'fail': 0},
            'consignment': {'cases': [], 'success': 0, 'fail': 0},
            'order': {'cases': [], 'success': 0, 'fail': 0},
            'search': {'cases': [], 'success': 0, 'fail': 0}
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
                test_case_result = {
                    'name': case['case_name'],
                    'status': 'Pass' if result else 'Fail',
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                self.test_results['registration']['cases'].append(test_case_result)
                
                if result:
                    self.test_results['registration']['success'] += 1
                else:
                    self.test_results['registration']['fail'] += 1
                print(f"-> [RESULT] {'Success' if result else 'Failure'}")
            except Exception as e:
                print(f"-> [SYSTEM ERROR] Error running test case: {str(e)}")
                self.test_results['registration']['fail'] += 1
                self.test_results['registration']['cases'].append({
                    'name': case['case_name'],
                    'status': 'Error',
                    'error': str(e),
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

        for account in self.accounts:
            print(f"\n=== Starting test with account: {account['email']} ({account['description']}) ===")
            
            # Perform login
            login_success = False
            try:
                sleep(2)
                login_success = self.login_handler.login(account)
                test_case_result = {
                    'name': f"Login: {account['email']}",
                    'status': 'Pass' if login_success else 'Fail',
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                self.test_results['login']['cases'].append(test_case_result)
                
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
                            test_case_result = {
                                'name': consignment_case['case_name'],
                                'status': 'Pass' if create_success else 'Fail',
                                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            self.test_results['consignment']['cases'].append(test_case_result)
                            
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
                            test_case_result = {
                                'name': order_case['case_name'],
                                'status': 'Pass' if add_success else 'Fail',
                                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            self.test_results['order']['cases'].append(test_case_result)
                            
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
                            test_case_result = {
                                'name': f"Search order #{search_case['order_id']}",
                                'status': 'Pass' if search_success else 'Fail',
                                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            self.test_results['search']['cases'].append(test_case_result)
                            
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

        # Show test summary và export Excel
        self.show_test_summary()
        self.export_to_excel()

    def show_test_summary(self):
        print("\n=== TEST RESULTS SUMMARY ===")
        print(f"1. Registration: Success {self.test_results['registration']['success']}, Fail {self.test_results['registration']['fail']}")
        print(f"2. Login: Success {self.test_results['login']['success']}, Fail {self.test_results['login']['fail']}")
        print(f"3. Create consignment: Success {self.test_results['consignment']['success']}, Fail {self.test_results['consignment']['fail']}")
        print(f"4. Add order: Success {self.test_results['order']['success']}, Fail {self.test_results['order']['fail']}")
        print(f"5. Search order: Success {self.test_results['search']['success']}, Fail {self.test_results['search']['fail']}")
        
        total_success = sum([v['success'] for k, v in self.test_results.items()])
        total_fail = sum([v['fail'] for k, v in self.test_results.items()])
        
        print(f"\nTOTAL: {total_success} test cases passed, {total_fail} test cases failed")

    def export_to_excel(self):
        try:
            wb = openpyxl.Workbook()
            summary_sheet = wb.active
            summary_sheet.title = "Test Summary"
            
            # Summary headers
            summary_sheet.append(["Test Category", "Passed", "Failed", "Total"])
            
            # Summary data
            for category in self.test_results:
                passed = self.test_results[category]['success']
                failed = self.test_results[category]['fail']
                total = passed + failed
                summary_sheet.append([category.capitalize(), passed, failed, total])
            
            # Detailed results sheet
            details_sheet = wb.create_sheet("Detailed Results")
            details_sheet.append(["Test Case", "Category", "Status", "Timestamp"])
            
            for category in self.test_results:
                for case in self.test_results[category]['cases']:
                    details_sheet.append([
                        case['name'],
                        category.capitalize(),
                        case['status'],
                        case['timestamp']
                    ])
            
            # Auto-adjust columns
            for sheet in wb:
                for column in sheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = (max_length + 2) * 1.2
                    sheet.column_dimensions[column_letter].width = adjusted_width
            
            # Save file
            
            filename = f"Test_Results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            wb.save(filename)
            print(f"\n[SYSTEM] Test results exported to {filename}")
            
        except Exception as e:
            print(f"\n[SYSTEM ERROR] Failed to export to Excel: {str(e)}")

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