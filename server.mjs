import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import { networkInterfaces } from 'node:os'
import { resolve } from 'node:path'
import { ReadlineParser, SerialPort } from 'serialport'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const port = Number(process.env.PORT || 3000)
const serialPath = process.env.SERIAL_PORT || 'COM3'
const serialBaudRate = Number(process.env.SERIAL_BAUD_RATE || 115200)

const defaultBrightness = Number(process.env.LIGHT_DEFAULT_BRIGHTNESS || 80)
const defaultColor = /^#[0-9a-f]{6}$/i.test(process.env.LIGHT_DEFAULT_COLOR || '')
  ? process.env.LIGHT_DEFAULT_COLOR.toLowerCase()
  : '#d65a57'

let lightState = {
  on: (process.env.LIGHT_DEFAULT_ON || 'true').toLowerCase() === 'true',
  brightness: Number.isFinite(defaultBrightness)
    ? Math.round(Math.min(100, Math.max(0, defaultBrightness)))
    : 80,
  color: defaultColor,
  updatedAt: new Date().toISOString(),
}

let serialPort = null
let serialRetryTimer = null
let hardwareConnected = false

function setHardwareConnected(connected) {
  if (hardwareConnected === connected) return
  hardwareConnected = connected
  io.emit('hardware:status', { connected, port: serialPath })
  console.log(`ESP32 ${connected ? 'connected' : 'disconnected'} (${serialPath})`)
}

function sendLightToEsp32() {
  if (!serialPort?.isOpen) return false

  serialPort.write(`${JSON.stringify({ type: 'light', ...lightState })}\n`, (error) => {
    if (error) console.error('ESP32 write failed:', error.message)
  })
  return true
}

function scheduleSerialRetry() {
  if (serialRetryTimer) return
  serialRetryTimer = setTimeout(() => {
    serialRetryTimer = null
    openSerial()
  }, 3000)
}

function openSerial() {
  if (serialPort?.isOpen || serialPort?.opening) return

  serialPort = new SerialPort({
    path: serialPath,
    baudRate: serialBaudRate,
    autoOpen: false,
  })
  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }))

  parser.on('data', (line) => {
    const text = line.trim()
    if (!text) return

    try {
      const message = JSON.parse(text)
      if (message.type === 'ready') {
        setHardwareConnected(true)
        sendLightToEsp32()
      }
    } catch {
      console.log(`[ESP32] ${text}`)
    }
  })

  serialPort.on('open', () => {
    setHardwareConnected(true)
    // Opening a serial port can reset ESP32; wait for setup() before sending.
    setTimeout(sendLightToEsp32, 1500)
  })
  serialPort.on('close', () => {
    setHardwareConnected(false)
    scheduleSerialRetry()
  })
  serialPort.on('error', (error) => {
    setHardwareConnected(false)
    console.error(`Cannot open ${serialPath}: ${error.message}`)
    scheduleSerialRetry()
  })
  serialPort.open()
}

function normalizeLightUpdate(update) {
  const next = { ...lightState }

  if (typeof update?.on === 'boolean') next.on = update.on
  if (Number.isFinite(update?.brightness)) {
    next.brightness = Math.round(Math.min(100, Math.max(0, update.brightness)))
  }
  if (typeof update?.color === 'string' && /^#[0-9a-f]{6}$/i.test(update.color)) {
    next.color = update.color.toLowerCase()
  }

  next.updatedAt = new Date().toISOString()
  return next
}

io.on('connection', (socket) => {
  socket.emit('light:state', lightState)
  socket.emit('hardware:status', { connected: hardwareConnected, port: serialPath })

  socket.on('light:set', (update, acknowledge) => {
    lightState = normalizeLightUpdate(update)
    io.emit('light:state', lightState)
    const delivered = sendLightToEsp32()
    acknowledge?.({ ok: true, delivered, state: lightState })
  })
})

app.get('/api/light', (_request, response) => response.json(lightState))
app.get('/api/hardware', (_request, response) => {
  response.json({ connected: hardwareConnected, port: serialPath, baudRate: serialBaudRate })
})
app.use(express.static(resolve('dist')))
app.use((_request, response) => response.sendFile(resolve('dist', 'index.html')))

openSerial()

httpServer.listen(port, '0.0.0.0', () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((item) => item?.family === 'IPv4' && !item.internal)
    .map((item) => `http://${item.address}:${port}`)

  console.log(`Light controller: http://localhost:${port}`)
  for (const address of addresses) console.log(`Phone (same Wi-Fi): ${address}`)
})
