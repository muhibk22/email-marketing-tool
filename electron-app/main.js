const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let backendProcess = null;

function startBackend() {
  const backendPath = isDev 
    ? path.join(__dirname, '..', 'backend', 'run_server.exe')
    : path.join(process.resourcesPath, 'app', 'backend', 'run_server.exe');
  
  console.log('Starting backend from:', backendPath);
  
  backendProcess = spawn(backendPath, [], {
    stdio: 'pipe',
    windowsHide: false,
    detached: false
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend process...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill();
    }
    backendProcess = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow network requests in development
    },
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));

  // Open DevTools in development mode
  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Start the backend server
  startBackend();
  
  // Create the main window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle app closing
app.on('will-quit', () => {
  stopBackend();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
