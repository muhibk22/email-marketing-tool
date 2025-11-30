const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const isProd = process.env.NODE_ENV === 'production' || app.isPackaged;

let backendProcess = null;


function startBackend() {
  let command, args, options;

  if (isDev) {
    // In development, run Python directly with uvicorn
    const backendDir = path.join(__dirname, '..', 'backend');
    command = 'uvicorn';
    args = ['app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'];
    options = {
      cwd: backendDir,
      stdio: 'pipe',
      shell: true
    };
    console.log('Starting backend in DEV mode with uvicorn from:', backendDir);
  } else {
    // In production, use the compiled .exe
    const backendPath = path.join(process.resourcesPath, 'app', 'backend', 'run_server.exe');
    command = backendPath;
    args = [];
    options = {
      stdio: 'pipe',
      windowsHide: false,
      detached: false
    };
    console.log('Starting backend in PRODUCTION mode from:', backendPath);
  }

  backendProcess = spawn(command, args, options);

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
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
    icon: path.join(__dirname, "assets", "logo.jpg"),
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));

  // Open DevTools in development mode only
  if (isDev && !isProd) {
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
