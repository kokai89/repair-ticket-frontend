const { app, BrowserWindow } = require('electron')
const { exec } = require('child_process')
const path = require('path')

// Start backend service
const backendPath = path.join(__dirname, '../../backend/dist/repair-ticket-backend')
const backendProcess = exec(backendPath)

backendProcess.stdout.on('data', (data) => {
  console.log(`Backend: ${data}`)
})

backendProcess.stderr.on('data', (data) => {
  console.error(`Backend Error: ${data}`)
})

backendProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`)
})
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 加载React应用
  mainWindow.loadURL(
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3005'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )

  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
