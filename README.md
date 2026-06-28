# 🌬️ AIRSENSE: IoT Asthma Micro-Environment Monitor

AIRSENSE adalah sistem pemantauan mikro-lingkungan portabel berbasis *Internet of Things* (IoT) yang dirancang khusus untuk memitigasi risiko serangan asma. 

Perangkat keras (ESP32) secara aktif mendeteksi parameter cuaca dan kualitas udara sekitar, memberikan peringatan visual dan audio saat ambang batas bahaya terlewati, serta mengirimkan data telemetri secara *real-time* ke *cloud*. Data ini divisualisasikan melalui dasbor *Progressive Web App* (PWA) yang responsif dan dapat diinstal di perangkat Android pengguna.

## ✨ Fitur Utama

* **Real-Time Telemetry:** Pembaruan data sensor ke Dasbor web setiap 10 detik melalui integrasi Firestore `onSnapshot()`.
* **Smart Local Failsafe:** Aktuator *buzzer* dan LED akan menyala secara otomatis dari perangkat fisik saat kondisi lingkungan terdeteksi buruk, tanpa bergantung pada latensi internet.
* **Mute Control:** Dilengkapi *push-button* fisik untuk mematikan alarm (*mute*) secara instan.
* **PWA Ready:** Dasbor web (React + Vite) mendukung instalasi *Progressive Web App* dengan pengalaman *fullscreen native* di *smartphone* Android.
* **Secure Access:** Sistem autentikasi Firebase untuk membatasi akses dasbor pemantauan.

## 🛠️ Tech Stack

**Perangkat Keras (IoT Edge):**
* ESP32 Development Board
* Sensor DHT22 (Suhu & Kelembapan)
* Sensor MQ-135 (Kualitas Udara / Gas Polutan)
* Sensor GUVA-S12D (Indeks UV)
* Active Buzzer & Red LED (Indikator Alarm)
* Push Button (Mute Alarm) & Saklar Utama (Power ON/OFF)

**Backend & Layanan Cloud:**
* Firebase Authentication (Email & Password)
* Firebase Cloud Firestore (NoSQL Database)

**Frontend (PWA Dashboard):**
* React.js
* Vite
* Vite PWA Plugin

## 🗄️ Struktur Basis Data (Firestore)

Sistem menggunakan koleksi tunggal untuk menjaga efisiensi pembacaan data *real-time*:
* **Document:** `sensor_data/latest`
* **Fields:** `temperature`, `humidity`, `airQuality`, `uvIndex`, `riskLevel`, `timestamp`

## 👨‍💻 Pengembang

**Yuraddin**
Teknik Komputer, Universitas Syiah Kuala
