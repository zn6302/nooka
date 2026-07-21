# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## 用手機做燈光控制

1. 複製 `.env.example` 為 `.env`，視需要修改服務埠與燈光預設值。
2. 將 `esp32/nooka_serial_controller/nooka_serial_controller.ino` 燒錄至 ESP32。
3. 執行 `npm run build`。
4. 執行 `npm start`，終端機會顯示手機可開啟的區網網址。
5. 手機與電腦連上同一個 Wi-Fi，開啟該網址，在「模式」頁控制燈光開關與亮度。
6. 關閉 Arduino Serial Monitor，避免占用 COM 埠，再啟動 Node.js。

ESP32 端只需要 Arduino Library Manager 的 `ArduinoJson`。手機經 Wi-Fi 連至 Node.js，Node.js 再透過 USB Serial 控制 ESP32。