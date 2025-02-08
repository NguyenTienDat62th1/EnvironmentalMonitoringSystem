import random
import sched
import time

scheduler = sched.scheduler(time.time, time.sleep)

def send_temperature():
    temperature = round(random.uniform(10.0, 40.0), 2)
    print(f"Nhiệt độ hiện tại: {temperature}°C")
    scheduler.enter(15 * 60, 1, send_temperature)  # Lên lịch chạy lại sau 15 phút

scheduler.enter(0, 1, send_temperature)
scheduler.run()
