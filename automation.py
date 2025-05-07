import mysql.connector
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import os

# Kết nối đến cơ sở dữ liệu
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="120804",
    database="ConsignmentTH"
)
cursor = db.cursor()

# Chỉ test với tài khoản User
test_user = ("cus@example.com", "12345", "User", "User đúng")

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 15)

def login(email, password):
    print(f"\nĐang đăng nhập với email: {email}")
    try:
        driver.get("http://localhost:3000/login")
        sleep(2)

        # Nhập thông tin đăng nhập
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        email_input.clear()
        email_input.send_keys(email)
        
        password_input = wait.until(EC.presence_of_element_located((By.ID, "password")))
        password_input.clear()
        password_input.send_keys(password)
        
        # Click nút đăng nhập
        login_button = wait.until(EC.element_to_be_clickable((By.ID, "loginButton")))
        login_button.click()
        sleep(3)
        
        # Kiểm tra đăng nhập thành công
        wait.until(EC.url_contains("home"))
        print("-> Đăng nhập thành công")
        return True
        
    except Exception as e:
        print(f"-> Đăng nhập thất bại: {str(e)}")
        return False

def test_create_consignment():
    print("\n=== Bắt đầu test tạo Consignment ===")
    try:
        # Đi thẳng đến trang tạo consignment
        driver.get("http://localhost:3000/CreateConsign")
        sleep(3)
        
        # Kiểm tra đã vào trang create consignment
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//h3[contains(., 'New Consignment Request')]")))
        
        # Điền thông tin sản phẩm
        product_name = wait.until(EC.presence_of_element_located((By.NAME, "Product_name")))
        product_name.send_keys("Nike Air Force 1")
        
        original_price = driver.find_element(By.NAME, "Original_price")
        original_price.send_keys("1000000")
        
        sale_price = driver.find_element(By.NAME, "Sale_price")
        sale_price.send_keys("1800000")
        
        # Chọn brand
        brand_select = driver.find_element(By.NAME, "Brand_name")
        brand_select.click()
        sleep(1)
        driver.find_element(By.XPATH, "//option[contains(., 'Nike')]").click()
        
        # Chọn product type
        type_select = driver.find_element(By.NAME, "Product_type_name")
        type_select.click()
        sleep(1)
        driver.find_element(By.XPATH, "//option[contains(., 'Shoes')]").click()
        
        quantity = driver.find_element(By.NAME, "Quantity")
        quantity.send_keys("1")
        
        # Upload ảnh - PHẦN QUAN TRỌNG ĐÃ ĐƯỢC SỬA
        image_path = os.path.abspath("hình ảnh.png")  # Đổi tên file ảnh nếu cần
        if not os.path.exists(image_path):
            # Nếu không tìm thấy file test, tạo file ảnh mẫu
            from PIL import Image
            img = Image.new('RGB', (100, 100), color='red')
            img.save(image_path)
            print(f"-> Đã tạo file ảnh mẫu tại: {image_path}")
        
        print(f"-> Đang upload ảnh từ: {image_path}")
        image_input = driver.find_element(By.XPATH, "//input[@type='file']")
        
        # Hiển thị input file trước khi upload (nếu bị ẩn)
        driver.execute_script("arguments[0].style.display = 'block';", image_input)
        image_input.send_keys(image_path)
        sleep(2)
        
        # Kiểm tra ảnh đã được upload
        try:
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//img[contains(@src, 'blob:') or contains(@src, 'data:image')]")))
            print("-> Upload ảnh thành công")
        except:
            print("-> Không xác nhận được ảnh đã upload")
        
        # Click Add Product
        add_button = driver.find_element(By.XPATH, "//button[contains(., 'Add Product')]")
        add_button.click()
        sleep(2)
        
        # Kiểm tra sản phẩm đã được thêm vào bảng
        product_table = wait.until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
        rows = product_table.find_elements(By.TAG_NAME, "tr")
        assert len(rows) == 1
        print("-> Đã thêm sản phẩm vào danh sách")
        
        # Submit consignment
        submit_button = driver.find_element(By.XPATH, "//button[contains(., 'Submit Consignment')]")
        submit_button.click()
        sleep(3)
        
        # Kiểm tra modal thành công xuất hiện
        success_modal = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//div[contains(@class, 'modal-content')]")))
        print("-> Modal xác nhận thành công xuất hiện")
        
        # Click nút OK trên modal
        ok_button = driver.find_element(By.XPATH, "//button[contains(., 'OK')]")
        ok_button.click()
        sleep(2)
        
        print("-> Tạo consignment thành công")
        return True
        
    except Exception as e:
        print(f"-> Lỗi khi tạo consignment: {str(e)}")
        return False

# Chạy test
email, password, account, description = test_user
if login(email, password):
    test_create_consignment()
    
    # Logout sau khi test xong
    try:
        logout_button = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Logout')]")))
        logout_button.click()
        sleep(2)
    except:
        pass

driver.quit()
cursor.close()
db.close()