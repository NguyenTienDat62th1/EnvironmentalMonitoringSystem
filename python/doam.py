import random
import sched
import time
from mongodb import get_db

# Tạo lịch chạy
scheduler = sched.scheduler(time.time, time.sleep)
current_humidity = round(random.uniform(40.0, 80.0), 2)
db = get_db()
collection = db["humidity_data"]

def send_humidity():
    global current_humidity  # Sử dụng biến toàn cục để lưu giá trị độ ẩm trước đó
    
    # Tạo sự thay đổi nhỏ (delta) cho độ ẩm, trong khoảng từ -1.5 đến 1.5
    delta = random.uniform(-1.5, 1.5)
    new_humidity = current_humidity + delta
    
    # Giới hạn giá trị trong khoảng từ 40 đến 80
    new_humidity = max(40.0, min(new_humidity, 80.0))
    
    # Làm tròn giá trị đến 2 chữ số thập phân
    new_humidity = round(new_humidity, 2)
    
    # Cập nhật giá trị độ ẩm hiện tại
    current_humidity = new_humidity
    
    # Lấy thời gian hiện tại
    current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    data = {"timestamp": current_time, "humidity": current_humidity}
    collection.insert_one(data)
    
    # In ra thông số độ ẩm
    print(f"[{current_time}] Độ ẩm hiện tại: {current_humidity}%")
    
    # Lên lịch chạy lại sau 15 phút
    scheduler.enter(15 * 60, 1, send_humidity)

# Bắt đầu chạy lần đầu tiên
scheduler.enter(0, 1, send_humidity)
scheduler.run()
