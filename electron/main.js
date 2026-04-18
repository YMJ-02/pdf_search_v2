const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let backendProcess;
const PORT = 5001;

function getBackendPath() {
  if (app.isPackaged) {
    const execName = process.platform === 'win32' ? 'backend.exe' : 'backend';
    return path.join(process.resourcesPath, 'backend', execName);
  }
  return null;
}

function getDataDir() {
  const dataDir = path.join(app.getPath('userData'), 'pdf_search_data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

function startBackend() {
  const dataDir = getDataDir();
  const backendExe = getBackendPath();
  let proc;

  if (backendExe && fs.existsSync(backendExe)) {
    proc = spawn(backendExe, [], {
      cwd: dataDir,
      env: { ...process.env, DATA_DIR: dataDir },
      detached: false,
    });
  } else {
    const backendScript = path.join(__dirname, '..', 'backend', 'app.py');
    proc = spawn('python', [backendScript], {
      cwd: path.join(__dirname, '..', 'backend'),
      env: { ...process.env, DATA_DIR: dataDir },
    });
  }

  proc.stdout.on('data', d => console.log('[backend]', d.toString()));
  proc.stderr.on('data', d => console.error('[backend]', d.toString()));
  proc.on('exit', code => console.log('[backend] exited', code));
  backendProcess = proc;
}

function waitForBackend(retries = 30, interval = 600) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const req = http.get(`http://127.0.0.1:${PORT}/api/ping`, res => {
        if (res.statusCode === 200) resolve();
        else retry();
      });
      req.on('error', retry);
      req.setTimeout(400, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      attempts++;
      if (attempts >= retries) reject(new Error('Backend timeout'));
      else setTimeout(check, interval);
    };
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#080808',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenu(null);

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend_dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  startBackend();
  try {
    await waitForBackend();
  } catch (e) {
    console.error('Backend did not start in time, continuing anyway...');
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) { backendProcess.kill(); backendProcess = null; }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) { backendProcess.kill(); backendProcess = null; }
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return result.canceled ? [] : result.filePaths;
});
