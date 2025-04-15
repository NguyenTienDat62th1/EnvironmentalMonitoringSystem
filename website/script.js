document.addEventListener("DOMContentLoaded", function () {
    const charts = {};

    // Xử lý sự kiện đăng nhập
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Đăng nhập thành công!");
                localStorage.setItem("token", data.token); // Lưu token
                location.reload(); // Refresh trang
            } else {
                alert("Sai tài khoản hoặc mật khẩu!");
            }
        })
        .catch(error => console.error("Lỗi khi đăng nhập:", error));
    });

    // Xử lý sự kiện đăng ký
    document.getElementById("registerForm").addEventListener("submit", function(event) {
        event.preventDefault();
    
        // Lấy giá trị nhập vào
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirmPassword").value;
    
        // Kiểm tra định dạng email hợp lệ
        if (!validateEmail(email)) {
            alert("Email không hợp lệ! Vui lòng nhập đúng định dạng email.");
            return;
        }

        // Kiểm tra mật khẩu có đáp ứng yêu cầu
    if (!validatePassword(password)) {
        alert("Mật khẩu không hợp lệ! Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ cái viết hoa, 1 số và không chứa ký tự đặc biệt.");
        return;
    }
    
        // Kiểm tra mật khẩu nhập lại
        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }
    
        // Tạo dữ liệu gửi đi
        const userData = {
            email: email,
            password: password
        };
    
        // Gửi request đăng ký
        fetch("http://127.0.0.1:8000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            alert("Đăng ký thành công!");
            document.getElementById("registerForm").reset();
            new bootstrap.Modal(document.getElementById("registerModal")).hide();
        })
        .catch(error => {
            console.error("Lỗi khi đăng ký:", error);
            alert("Đăng ký thất bại, thử lại sau!");
        });
    });
    
    // Hàm kiểm tra định dạng email hợp lệ
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Hàm kiểm tra mật khẩu hợp lệ
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}
    

    const sensorData = [
        { id: "temperature", icon: "fas fa-temperature-high", name: "Temperature", unit: "°C" },
        { id: "humidity", icon: "fas fa-tint", name: "Air Humidity", unit: "%" },
        { id: "soil_moisture", icon: "fas fa-water", name: "Soil Moisture", unit: "%" },
        { id: "pH", icon: "fas fa-flask", name: "Soil pH", unit: "" },
        { id: "light", icon: "fas fa-sun", name: "Light Intensity", unit: "lux" },
        { id: "CO2", icon: "fas fa-smog", name: "CO2 Level", unit: "ppm" },
        { id: "nutrients", icon: "fas fa-seedling", name: "Soil Nutrients", unit: "" },
        { id: "wind_speed", icon: "fas fa-wind", name: "Wind Speed", unit: "km/h" },
        { id: "wind_direction", icon: "fas fa-compass", name: "Wind Direction", unit: "°" },
        { id: "water_quality", icon: "fas fa-water", name: "Water Quality", unit: "TDS" }
    ];

    const container = document.getElementById("sensor-container");

    

    // Tạo thẻ card cảm biến
    sensorData.forEach(sensor => {
        const card = document.createElement("div");
        card.className = "col-md-3 mb-4";
        card.innerHTML = `
            <div class="card sensor-card">
                <div class="card-body">
                    <h5 class="card-title"><i class="${sensor.icon}"></i> ${sensor.name}</h5>
                    <h2 class="sensor-value" id="${sensor.id}">-- ${sensor.unit}</h2>
                    <canvas id="${sensor.id}Chart"></canvas>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Hàm tạo dữ liệu ngẫu nhiên cho biểu đồ
    function generateRandomData(min, max, length = 10) {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    // Tạo biểu đồ cho từng cảm biến
    sensorData.forEach(sensor => {
        const ctx = document.getElementById(`${sensor.id}Chart`).getContext("2d");
    
        // Xử lý đơn vị đo
        const unitText = sensor.unit ? `${sensor.unit}` : '';
    
        const chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: [],  // Sẽ được cập nhật sau
                datasets: [{
                    label: sensor.name,
                    data: [],  // Sẽ được cập nhật sau
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: unitText
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian'
                        }
                    }
                }
            }
        });
    
        // Lưu biểu đồ vào charts
        charts[sensor.id] = chart;
    });
    // sensorData.forEach(sensor => {
    //     const ctx = document.getElementById(`${sensor.id}Chart`).getContext("2d");

    //     new Chart(ctx, {
    //         type: "line",
    //         data: {
    //             labels: Array.from({ length: 10 }, (_, i) => i + 1), // Nhãn từ 1 đến 10
    //             datasets: [{
    //                 label: sensor.name,
    //                 data: generateRandomData(sensor.min, sensor.max),
    //                 borderColor: "blue",
    //                 borderWidth: 2,
    //                 fill: false
    //             }]
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             scales: {
    //                 y: {
    //                     suggestedMin: sensor.min, // Giới hạn dưới
    //                     suggestedMax: sensor.max  // Giới hạn trên
    //                 }
    //             }
    //         }
    //     });
    // });
    // Hàm lấy dữ liệu từ API
    function fetchData() {
        fetch("http://127.0.0.1:8000/sensors/latest_all")
            .then(response => response.json())
            .then(sensorValues => {
                console.log("Dữ liệu nhận được:", sensorValues);

                for (let sensor in sensorValues) {
                    const element = document.getElementById(sensor);
                    if (element) {
                        const value = sensorValues[sensor].value;
                        const unit = getUnit(sensor);
                        element.innerHTML = `${value} ${unit}`;
                        updateChart(sensor, value);
                    }
                }
            })
            .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
    }

    setInterval(fetchData, 5000);

    // Hàm lấy đơn vị đo
    function getUnit(sensor) {
        const units = {
            "temperature": "°C",
            "humidity": "%",
            "soil_moisture": "%",
            "pH": "",
            "light": "lux",
            "CO2": "ppm",
            "nutrients": "",
            "wind_speed": "km/h",
            "wind_direction": "°",
            "water_quality": "TDS"
        };
        return units[sensor] || "";
    }
    // Cập nhật dữ liệu vào biểu đồ
    function updateChart(sensorId, newValue) {
        const chart = charts[sensorId];
        if (chart) {
            if (chart.data.labels.length >= 10) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            chart.data.labels.push(new Date().toLocaleTimeString());
            chart.data.datasets[0].data.push(newValue);
            chart.update();
        }
    }


//     // Khởi tạo biểu đồ nhiệt độ
// function initTemperatureChart() {
//     const temperatureChartContainer = document.getElementById('sensor-container-temperature');
//     const temperatureChartDiv = document.createElement('div');
//     temperatureChartDiv.className = 'col-md-12 mb-4';
//     temperatureChartDiv.innerHTML = `
//         <div class="card">
//             <div class="card-header">
//                 <h5 class="card-title">Biểu đồ nhiệt độ</h5>
//             </div>
//             <div class="card-body">
//                 <canvas id="temperatureChart"></canvas>
//             </div>
//         </div>
//     `;
//     temperatureChartContainer.appendChild(temperatureChartDiv);

//     const ctx = document.getElementById('temperatureChart').getContext('2d');
//     const temperatureChart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: [],
//             datasets: [{
//                 label: 'Nhiệt độ (°C)',
//                 data: [],
//                 borderColor: 'rgb(75, 192, 192)',
//                 tension: 0.1,
//                 fill: false
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 y: {
//                     beginAtZero: false,
//                     title: {
//                         display: true,
//                         text: 'Nhiệt độ (°C)'
//                     }
//                 },
//                 x: {
//                     title: {
//                         display: true,
//                         text: 'Thời gian'
//                     }
//                 }
//             }
//         }
//     });

//     // Lưu biểu đồ vào charts
//     charts['temperature'] = temperatureChart;
// }

// // Gọi hàm khởi tạo biểu đồ nhiệt độ
// initTemperatureChart();


// // Gọi api lấy dữ liệu nhiệt độ trong ngày
// function fetchTemperatureData() {
//     fetch("[http://127.0.0.1](http://127.0.0.1):8000/sensors/temperature/today")
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(result => {
//             console.log("Dữ liệu nhiệt độ trong ngày:", result);
//             const chart = charts["temperature"];
//             if (chart && result.data && result.data.length > 0) {
//                 // Lọc và format dữ liệu
//                 const hourlyData = result.data.filter((item) => {
//                     const time = new Date(item.create_time);
//                     const hour = time.getHours();
//                     return hour % 2 === 0; // Lấy dữ liệu mỗi 2 giờ
//                 });

//                 // Format dữ liệu cho biểu đồ
//                 const labels = hourlyData.map(item => {
//                     const time = new Date(item.create_time);
//                     return `${time.getHours()}:00`;
//                 });
//                 const values = hourlyData.map(item => parseFloat(item.value));

//                 // Cập nhật dữ liệu biểu đồ
//                 chart.data.labels = labels;
//                 chart.data.datasets[0].data = values;
//                 chart.update();
//             }
//         })
//         .catch(error => {
//             console.error("Lỗi khi lấy dữ liệu:", error);
//             // Hiển thị thông báo lỗi
//             const chart = charts["temperature"];
//             if (chart) {
//                 chart.data.labels = ['Lỗi'];
//                 chart.data.datasets[0].data = [0];
//                 chart.update();
//             }
//         });
// }

// // Gọi hàm fetchTemperatureData mỗi 5 phút
// fetchTemperatureData();
// setInterval(fetchTemperatureData, 5000);

});


// Khởi tạo biểu đồ nhiệt độ
// function initTemperatureChart() {
//     const temperatureChartContainer = document.getElementById('sensor-container-temperature');
//     const temperatureChartDiv = document.createElement('div');
//     temperatureChartDiv.className = 'col-md-12 mb-4';
//     temperatureChartDiv.innerHTML = `
//         <div class="card">
//             <div class="card-header">
//                 <h5 class="card-title">Biểu đồ nhiệt độ</h5>
//             </div>
//             <div class="card-body">
//                 <canvas id="temperatureChart"></canvas>
//             </div>
//         </div>
//     `;
//     temperatureChartContainer.appendChild(temperatureChartDiv);

//     const ctx = document.getElementById('temperatureChart').getContext('2d');
//     const temperatureChart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: [],
//             datasets: [{
//                 label: 'Nhiệt độ (°C)',
//                 data: [],
//                 borderColor: 'rgb(75, 192, 192)',
//                 tension: 0.1,
//                 fill: false
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 y: {
//                     beginAtZero: false,
//                     title: {
//                         display: true,
//                         text: 'Nhiệt độ (°C)'
//                     }
//                 },
//                 x: {
//                     title: {
//                         display: true,
//                         text: 'Thời gian'
//                     }
//                 }
//             }
//         }
//     });

//     // Lưu biểu đồ vào charts
//     charts['temperature'] = temperatureChart;
// }

// Gọi hàm khởi tạo biểu đồ nhiệt độ
initTemperatureChart();


// Gọi api lấy dữ liệu nhiệt độ trong ngày
// function fetchTemperatureData() {
//     fetch("[http://127.0.0.1](http://127.0.0.1):8000/sensors/temperature/today")
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(result => {
//             console.log("Dữ liệu nhiệt độ trong ngày:", result);
//             const chart = charts["temperature"];
//             if (chart && result.data && result.data.length > 0) {
//                 // Lọc và format dữ liệu
//                 const hourlyData = result.data.filter((item) => {
//                     const time = new Date(item.create_time);
//                     const hour = time.getHours();
//                     return hour % 2 === 0; // Lấy dữ liệu mỗi 2 giờ
//                 });

//                 // Format dữ liệu cho biểu đồ
//                 const labels = hourlyData.map(item => {
//                     const time = new Date(item.create_time);
//                     return `${time.getHours()}:00`;
//                 });
//                 const values = hourlyData.map(item => parseFloat(item.value));

//                 // Cập nhật dữ liệu biểu đồ
//                 chart.data.labels = labels;
//                 chart.data.datasets[0].data = values;
//                 chart.update();
//             }
//         })
//         .catch(error => {
//             console.error("Lỗi khi lấy dữ liệu:", error);
//             // Hiển thị thông báo lỗi
//             const chart = charts["temperature"];
//             if (chart) {
//                 chart.data.labels = ['Lỗi'];
//                 chart.data.datasets[0].data = [0];
//                 chart.update();
//             }
//         });
// }

// Gọi hàm fetchTemperatureData mỗi 5 phút
fetchTemperatureData();
setInterval(fetchTemperatureData, 5000);