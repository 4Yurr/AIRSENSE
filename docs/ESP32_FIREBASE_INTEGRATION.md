# Integrasi ESP32 dengan Firebase Firestore

Dokumentasi ini mendefinisikan format data yang dikirim ESP32 ke Firebase Firestore untuk aplikasi AIRSENSE.

## Struktur Collection

AIRSENSE menggunakan satu collection untuk data sensor terbaru:

```txt
sensor_data
```

## Struktur Document

Untuk dashboard realtime, ESP32 menulis data ke satu document tetap:

```txt
sensor_data
+-- latest
    +-- temperature
    +-- humidity
    +-- airQuality
    +-- uvIndex
    +-- riskLevel
    +-- timestamp
```

Path document:

```txt
sensor_data/latest
```

Document `latest` selalu berisi data sensor paling baru. Setiap ESP32 mengirim pembacaan baru, isi document ini diperbarui.

## Field Wajib

| Field | Tipe Data | Satuan | Keterangan |
| --- | --- | --- | --- |
| `temperature` | number | Celsius | Suhu dari sensor DHT22. |
| `humidity` | number | Percent | Kelembapan udara dari sensor DHT22. |
| `airQuality` | number | AQI/raw calibrated value | Nilai kualitas udara dari sensor MQ135. |
| `uvIndex` | number | UV Index | Indeks UV dari sensor GUVA-S12D. |
| `riskLevel` | string | `Rendah`, `Sedang`, `Tinggi` | Status risiko asma hasil analisis ESP32 atau sistem. |
| `timestamp` | timestamp/string ISO | Waktu | Waktu data terakhir dikirim. |

Rekomendasi nilai `riskLevel`:

```txt
Rendah
Sedang
Tinggi
```

Gunakan penulisan yang konsisten karena aplikasi membaca teks tersebut untuk menentukan warna status.

## Contoh Payload JSON

Contoh payload umum yang dikirim ESP32:

```json
{
  "temperature": 29.4,
  "humidity": 62,
  "airQuality": 75,
  "uvIndex": 3,
  "riskLevel": "Rendah",
  "timestamp": "2026-06-23T10:30:00+07:00"
}
```

Jika menggunakan Firebase SDK atau REST API yang mendukung server timestamp, `timestamp` sebaiknya diisi oleh server. Jika ESP32 mengirim waktu sendiri, gunakan format ISO 8601 agar mudah dibaca aplikasi.

## Contoh Data Normal

```json
{
  "temperature": 28.7,
  "humidity": 58,
  "airQuality": 55,
  "uvIndex": 2,
  "riskLevel": "Rendah",
  "timestamp": "2026-06-23T08:00:00+07:00"
}
```

Kondisi ini menunjukkan lingkungan relatif aman:

- suhu masih nyaman
- kelembapan cukup baik
- kualitas udara baik
- UV rendah

## Contoh Data Risiko Sedang

```json
{
  "temperature": 31.2,
  "humidity": 72,
  "airQuality": 130,
  "uvIndex": 6,
  "riskLevel": "Sedang",
  "timestamp": "2026-06-23T12:00:00+07:00"
}
```

Kondisi ini perlu diperhatikan:

- suhu mulai tinggi
- kelembapan tinggi
- kualitas udara mulai menurun
- UV berada pada level sedang-tinggi

## Contoh Data Risiko Tinggi

```json
{
  "temperature": 34.5,
  "humidity": 82,
  "airQuality": 220,
  "uvIndex": 9,
  "riskLevel": "Tinggi",
  "timestamp": "2026-06-23T14:00:00+07:00"
}
```

Kondisi ini berisiko tinggi untuk penderita asma:

- suhu tinggi
- kelembapan terlalu tinggi
- kualitas udara buruk
- UV tinggi

## Rekomendasi Interval Pengiriman Data

Untuk Firebase Spark Plan atau paket gratis, hindari mengirim data terlalu sering karena setiap update document dihitung sebagai operasi tulis Firestore.

Rekomendasi aman untuk tahap pengembangan:

```txt
30 detik sampai 60 detik per update
```

Rekomendasi untuk demo atau monitoring ringan:

```txt
60 detik per update
```

Hindari interval seperti 1 detik atau 5 detik kecuali hanya untuk pengujian singkat. Interval terlalu cepat dapat menghabiskan kuota tulis Firestore dengan cepat, terutama jika perangkat dibiarkan menyala terus-menerus.

Perkiraan jumlah update untuk satu device:

| Interval | Perkiraan write per hari |
| --- | ---: |
| 10 detik | 8.640 write |
| 30 detik | 2.880 write |
| 60 detik | 1.440 write |
| 5 menit | 288 write |

Untuk penggunaan jangka panjang, interval 60 detik atau 5 menit lebih aman. Jika data hanya perlu ditampilkan sebagai dashboard realtime sederhana, 60 detik sudah cukup stabil dan hemat.
