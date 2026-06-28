#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <Preferences.h>
#include <time.h>

// =========================
// AIRSENSE Configuration
// =========================

const char* WIFI_SSID = "Yurr";
const char* WIFI_PASSWORD = "12345678";

const char* API_KEY = "AIzaSyDx_sGPs3KdlEGa1XC1vlVbPdSJSLMmRJc";
const char* PROJECT_ID = "airsense-7b227";
const char* USER_EMAIL = "esp32@airsense.local";
const char* USER_PASSWORD = "Airsense123!";

const char* FIRESTORE_DATABASE_ID = "";
const char* FIRESTORE_DOCUMENT_PATH = "sensor_data/latest";

const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SECONDS = 0;
const int DAYLIGHT_OFFSET_SECONDS = 0;

// =========================
// Hardware Pin Mapping
// =========================

const int DHT_PIN = 23;
const int DHT_TYPE = DHT22;
const int MQ135_PIN = 34;
const int UV_PIN = 35;
const int BUZZER_PIN = 18;
const int LED_PIN = 19;
const int POWER_BUTTON_PIN = 4;

// =========================
// Timing and Sensor Settings
// =========================

const unsigned long SEND_INTERVAL_MS = 10000;
const unsigned long WIFI_RECONNECT_INTERVAL_MS = 5000;
const unsigned long BUTTON_DEBOUNCE_MS = 700;

const int ANALOG_SAMPLE_COUNT = 20;
const int ANALOG_SAMPLE_DELAY_MS = 5;
const float ADC_MAX_VALUE = 4095.0;
const float ADC_REFERENCE_VOLTAGE = 3.3;
const float DEFAULT_MQ135_BASELINE = 900.0;

// =========================
// Global Objects
// =========================

DHT dht(DHT_PIN, DHT_TYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
Preferences preferences;

float mq135Baseline = DEFAULT_MQ135_BASELINE;
bool systemEnabled = true;
unsigned long lastSendAt = 0;
unsigned long lastWifiReconnectAt = 0;
unsigned long lastButtonToggleAt = 0;

// =========================
// Helper Functions
// =========================

float readAnalogAverage(int pin) {
  long total = 0;

  for (int i = 0; i < ANALOG_SAMPLE_COUNT; i++) {
    total += analogRead(pin);
    delay(ANALOG_SAMPLE_DELAY_MS);
  }

  return total / (float)ANALOG_SAMPLE_COUNT;
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  unsigned long startedAt = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < 15000) {
    Serial.print(".");
    delay(500);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connection timeout. Reconnect will be retried.");
  }
}

void maintainWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  if (millis() - lastWifiReconnectAt >= WIFI_RECONNECT_INTERVAL_MS) {
    lastWifiReconnectAt = millis();
    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
  }
}

void setupTime() {
  configTime(GMT_OFFSET_SECONDS, DAYLIGHT_OFFSET_SECONDS, NTP_SERVER);

  struct tm timeInfo;
  if (getLocalTime(&timeInfo, 10000)) {
    Serial.println("NTP time synchronized.");
  } else {
    Serial.println("NTP sync failed. Timestamp will use millis fallback.");
  }
}

String getIsoTimestamp() {
  struct tm timeInfo;

  if (getLocalTime(&timeInfo, 1000)) {
    char timestamp[25];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", &timeInfo);
    return String(timestamp);
  }

  char fallbackTimestamp[25];
  snprintf(fallbackTimestamp, sizeof(fallbackTimestamp), "1970-01-01T00:00:%02luZ", (millis() / 1000) % 60);
  return String(fallbackTimestamp);
}

void setupFirebase() {
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.reconnectWiFi(true);
  Firebase.begin(&config, &auth);

  Serial.println("Firebase initialized.");
}

void loadMq135Baseline() {
  preferences.begin("airsense", false);
  mq135Baseline = preferences.getFloat("mq_base", DEFAULT_MQ135_BASELINE);

  Serial.print("MQ135 baseline: ");
  Serial.println(mq135Baseline);
}

void calibrateMq135Baseline() {
  mq135Baseline = readAnalogAverage(MQ135_PIN);
  preferences.putFloat("mq_base", mq135Baseline);

  Serial.print("New MQ135 baseline saved: ");
  Serial.println(mq135Baseline);

  digitalWrite(LED_PIN, HIGH);
  tone(BUZZER_PIN, 1600, 120);
  delay(180);
  digitalWrite(LED_PIN, LOW);
}

void handlePowerButton() {
  bool buttonPressed = digitalRead(POWER_BUTTON_PIN) == LOW;

  if (buttonPressed && millis() - lastButtonToggleAt > BUTTON_DEBOUNCE_MS) {
    lastButtonToggleAt = millis();
    systemEnabled = !systemEnabled;

    Serial.print("AIRSENSE system ");
    Serial.println(systemEnabled ? "ON" : "OFF");

    if (!systemEnabled) {
      digitalWrite(LED_PIN, LOW);
      noTone(BUZZER_PIN);
    }
  }
}

float calculateAirQuality(float mqRaw) {
  float usableRange = max(1.0f, ADC_MAX_VALUE - mq135Baseline);
  float delta = max(0.0f, mqRaw - mq135Baseline);
  float airQuality = (delta / usableRange) * 500.0;

  return constrain(airQuality, 0.0, 500.0);
}

float calculateUvIndex(float uvRaw) {
  float voltage = (uvRaw / ADC_MAX_VALUE) * ADC_REFERENCE_VOLTAGE;
  float uvIndex = voltage * 10.0;

  return constrain(uvIndex, 0.0, 15.0);
}

String calculateRiskLevel(float temperature, float humidity, float airQuality, float uvIndex) {
  if (
    airQuality >= 150.0 ||
    uvIndex >= 12.0 ||
    temperature >= 42.0 ||
    humidity >= 85.0 ||
    humidity <= 30.0
  ) {
    return "Tinggi";
  }

  if (
    airQuality >= 80.0 ||
    uvIndex >= 8.0 ||
    temperature >= 37.0 ||
    humidity >= 70.0 ||
    humidity <= 40.0
  ) {
    return "Sedang";
  }

  return "Rendah";
}

void updateIndicators(const String& riskLevel) {
  bool highRisk = riskLevel == "Tinggi";

  digitalWrite(LED_PIN, highRisk ? HIGH : LOW);

  if (highRisk) {
    tone(BUZZER_PIN, 2200);
  } else {
    noTone(BUZZER_PIN);
  }
}

bool sendToFirestore(
  float temperature,
  float humidity,
  float airQuality,
  float uvIndex,
  const String& riskLevel,
  const String& timestamp
) {
  if (WiFi.status() != WL_CONNECTED || !Firebase.ready()) {
    Serial.println("Firebase is not ready. Data not sent.");
    return false;
  }

  FirebaseJson content;
  content.set("fields/temperature/doubleValue", temperature);
  content.set("fields/humidity/doubleValue", humidity);
  content.set("fields/airQuality/doubleValue", airQuality);
  content.set("fields/uvIndex/doubleValue", uvIndex);
  content.set("fields/riskLevel/stringValue", riskLevel);
  content.set("fields/timestamp/timestampValue", timestamp);

  const char* updateMask = "temperature,humidity,airQuality,uvIndex,riskLevel,timestamp";

  bool success = Firebase.Firestore.patchDocument(
    &fbdo,
    PROJECT_ID,
    FIRESTORE_DATABASE_ID,
    FIRESTORE_DOCUMENT_PATH,
    content.raw(),
    updateMask
  );

  if (success) {
    Serial.println("Firestore updated: sensor_data/latest");
    return true;
  }

  Serial.print("Firestore update failed: ");
  Serial.println(fbdo.errorReason());
  return false;
}

void readAndSendSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read DHT22. Skipping this cycle.");
    return;
  }

  float mqRaw = readAnalogAverage(MQ135_PIN);
  float uvRaw = readAnalogAverage(UV_PIN);
  float airQuality = calculateAirQuality(mqRaw);
  float uvIndex = calculateUvIndex(uvRaw);
  String riskLevel = calculateRiskLevel(temperature, humidity, airQuality, uvIndex);
  String timestamp = getIsoTimestamp();

  updateIndicators(riskLevel);

  Serial.println("---- AIRSENSE Reading ----");
  Serial.print("Temperature: ");
  Serial.println(temperature);
  Serial.print("Humidity: ");
  Serial.println(humidity);
  Serial.print("MQ135 raw: ");
  Serial.println(mqRaw);
  Serial.print("Air quality: ");
  Serial.println(airQuality);
  Serial.print("UV raw: ");
  Serial.println(uvRaw);
  Serial.print("UV index: ");
  Serial.println(uvIndex);
  Serial.print("Risk level: ");
  Serial.println(riskLevel);
  Serial.print("Timestamp: ");
  Serial.println(timestamp);

  sendToFirestore(temperature, humidity, airQuality, uvIndex, riskLevel, timestamp);
}

// =========================
// Arduino Lifecycle
// =========================

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(MQ135_PIN, INPUT);
  pinMode(UV_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(POWER_BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(LED_PIN, LOW);
  noTone(BUZZER_PIN);

  analogReadResolution(12);
  analogSetPinAttenuation(MQ135_PIN, ADC_11db);
  analogSetPinAttenuation(UV_PIN, ADC_11db);

  dht.begin();
  loadMq135Baseline();
  connectWiFi();
  setupTime();
  setupFirebase();
}

void loop() {
  maintainWiFi();
  handlePowerButton();

  if (!systemEnabled) {
    return;
  }

  if (millis() - lastSendAt >= SEND_INTERVAL_MS) {
    lastSendAt = millis();
    readAndSendSensorData();
  }
}
