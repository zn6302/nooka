#include <Arduino.h>
#include <ArduinoJson.h>

// ==========================================
// Motor (TB6612)
// ==========================================
const int AIN1 = 16;
const int AIN2 = 17;
const int PWMA = 5;

// Hall sensor and mode button
const int HALL_PIN = 2;
const int MY_BUTTON_PIN = 21;

volatile bool magnetDetected = false;
volatile unsigned long lastHallTime = 0;
bool isMoving = false;

unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;
bool lastButtonState = HIGH;

int currentMode = 0;
int motorSpeed = 200;

// Common-anode RGB LED
const int RED_PIN = 13;
const int GREEN_PIN = 14;
const int BLUE_PIN = 27;
const int PWM_FREQ = 5000;
const int PWM_RESOLUTION = 8;

// RGB diagnostic buttons
const int btn1 = 18;
const int btn2 = 19;
const int btn3 = 25;
const int btn4 = 26;

// Physical light state
bool lightOn = false;
uint8_t lightBrightness = 80;
uint8_t lightRed = 255;
uint8_t lightGreen = 255;
uint8_t lightBlue = 255;

String serialLine;

void startMotor(int speed);
void stopMotor();
void brakeMotor();
void applyLight();
void setColor(int red, int green, int blue);
void waitRelease(int buttonPin);
void handleSerial();

void IRAM_ATTR hallISR() {
  unsigned long now = millis();
  if (now - lastHallTime > 50) {
    magnetDetected = true;
    lastHallTime = now;
  }
}

void sendReady() {
  JsonDocument message;
  message["type"] = "ready";
  message["device"] = "nooka-esp32";
  serializeJson(message, Serial);
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  serialLine.reserve(256);
  delay(500);

  pinMode(AIN1, OUTPUT);
  pinMode(AIN2, OUTPUT);
  pinMode(PWMA, OUTPUT);
  stopMotor();

  pinMode(HALL_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(HALL_PIN), hallISR, FALLING);
  pinMode(MY_BUTTON_PIN, INPUT);

  ledcAttach(RED_PIN, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(GREEN_PIN, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(BLUE_PIN, PWM_FREQ, PWM_RESOLUTION);

  pinMode(btn1, INPUT);
  pinMode(btn2, INPUT);
  pinMode(btn3, INPUT);
  pinMode(btn4, INPUT);

  // One-second red flash confirms the physical RGB wiring.
  lightOn = true;
  lightRed = 255;
  lightGreen = 0;
  lightBlue = 0;
  applyLight();
  delay(1000);
  lightOn = false;
  applyLight();

  sendReady();
}

void loop() {
  handleSerial();

  bool currentButtonState = digitalRead(MY_BUTTON_PIN);
  if (lastButtonState == LOW && currentButtonState == HIGH) {
    if (millis() - lastDebounceTime > debounceDelay && !isMoving) {
      currentMode = (currentMode + 1) % 3;
      magnetDetected = false;
      isMoving = true;
      startMotor(motorSpeed);
      lastDebounceTime = millis();
    }
  }
  lastButtonState = currentButtonState;

  if (isMoving && magnetDetected) {
    magnetDetected = false;
    brakeMotor();
    isMoving = false;
  }

  if (digitalRead(btn1) == HIGH) {
    setColor(255, 0, 0);
    waitRelease(btn1);
  } else if (digitalRead(btn2) == HIGH) {
    setColor(0, 255, 0);
    waitRelease(btn2);
  } else if (digitalRead(btn3) == HIGH) {
    setColor(0, 0, 255);
    waitRelease(btn3);
  } else if (digitalRead(btn4) == HIGH) {
    setColor(255, 0, 255);
    waitRelease(btn4);
  }

  delay(1);
}

void handleSerial() {
  while (Serial.available() > 0) {
    char incoming = static_cast<char>(Serial.read());

    if (incoming == '\n') {
      serialLine.trim();
      if (serialLine.length() > 0) {
        JsonDocument message;
        DeserializationError error = deserializeJson(message, serialLine);

        if (!error && message["type"] == "light") {
          if (message["on"].is<bool>()) lightOn = message["on"];
          if (message["brightness"].is<int>()) {
            lightBrightness = constrain(message["brightness"].as<int>(), 0, 100);
          }

          if (message["color"].is<const char*>()) {
            String color = message["color"].as<String>();
            if (color.length() == 7 && color[0] == '#') {
              lightRed = strtol(color.substring(1, 3).c_str(), nullptr, 16);
              lightGreen = strtol(color.substring(3, 5).c_str(), nullptr, 16);
              lightBlue = strtol(color.substring(5, 7).c_str(), nullptr, 16);
            }
          }

          applyLight();
        }
      }
      serialLine = "";
    } else if (incoming != '\r' && serialLine.length() < 255) {
      serialLine += incoming;
    }
  }
}

void applyLight() {
  float scale = lightOn ? lightBrightness / 100.0f : 0.0f;

  // Common-anode output is inverted.
  ledcWrite(RED_PIN, 255 - round(lightRed * scale));
  ledcWrite(GREEN_PIN, 255 - round(lightGreen * scale));
  ledcWrite(BLUE_PIN, 255 - round(lightBlue * scale));
}

void setColor(int red, int green, int blue) {
  lightRed = constrain(red, 0, 255);
  lightGreen = constrain(green, 0, 255);
  lightBlue = constrain(blue, 0, 255);
  lightOn = true;
  applyLight();
}

void startMotor(int speed) {
  analogWrite(PWMA, speed);
  digitalWrite(AIN1, HIGH);
  digitalWrite(AIN2, LOW);
}

void stopMotor() {
  digitalWrite(AIN1, LOW);
  digitalWrite(AIN2, LOW);
  analogWrite(PWMA, 0);
}

void brakeMotor() {
  analogWrite(PWMA, 255);
  digitalWrite(AIN1, HIGH);
  digitalWrite(AIN2, HIGH);
  delay(80);
  stopMotor();
}

void waitRelease(int buttonPin) {
  delay(30);
  while (digitalRead(buttonPin) == HIGH) {
    handleSerial();
    delay(10);
  }
  delay(30);
}
