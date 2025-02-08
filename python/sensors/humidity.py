import random
import sched
import time
import requests

# Lập lịch chạy
scheduler = sched.scheduler(time.time, time.sleep)
current_humidity = round(random.uniform(40.0, 80.0), 2)

def send_humidity():
    global current_humidity

    # Tạo sự thay đổi nhỏ từ -1.5% đến 1.5%
    delta = random.uniform(-1.5, 1.5)
    new_humidity = max(40.0, min(current_humidity + delta, 80.0))
    current_humidity = round(new_humidity, 2)

    # Lấy thời gian hiện tại
    current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    # Gửi dữ liệu đến FastAPI
    data = {"timestamp": current_time, "humidity": current_humidity}
    response = requests.post("http://127.0.0.1:8000/humidity", json=data)
    
    print(f"[{current_time}] Gửi độ ẩm: {current_humidity}%, Trạng thái: {response.status_code}")

    # Lên lịch chạy lại sau 15 phút
    scheduler.enter(15 * 60, 1, send_humidity)

scheduler.enter(0, 1, send_humidity)
scheduler.run()
