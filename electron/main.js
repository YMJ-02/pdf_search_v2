const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const net = require('net');

let mainWindow;
let backendProcess;
const PORT = 5001;

// ── 프로세스 트리 전체 종료 (Windows: taskkill /F /T, 기타: SIGTERM) ──
function killBackend() {
  if (!backendProcess) return;
  const pid = backendProcess.pid;
  backendProcess = null;
  try {
    if (process.platform === 'win32') {
      // /T: 자식 프로세스 트리까지 모두 종료
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGTERM');
    }
  } catch (e) {
    console.error('[backend] kill failed:', e.message);
  }
}

// ── 포트가 이미 사용 중인지 확인 ──
function isPortInUse(port) {
  return new Promise(resolve => {
    const tester = net.createServer()
      .once('error', () => resolve(true))   // 이미 사용 중
      .once('listening', () => tester.close(() => resolve(false)))
      .listen(port, '127.0.0.1');
  });
}

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

async function startBackend() {
  // 이미 포트가 열려 있으면 백엔드를 새로 띄우지 않음
  if (await isPortInUse(PORT)) {
    console.log('[backend] Port already in use — skipping launch.');
    return;
  }

  const dataDir = getDataDir();
  const backendExe = getBackendPath();

  const backendEnv = {
    ...process.env,
    DATA_DIR: dataDir,
    PYTHONUTF8: '1',
    PYTHONIOENCODING: 'utf-8',
    PYTHONLEGACYWINDOWSSTDIO: '0',
  };

  let proc;
  if (backendExe && fs.existsSync(backendExe)) {
    proc = spawn(backendExe, [], {
      cwd: dataDir,
      env: backendEnv,
      detached: false,
      // stdio: 'ignore' 로 하면 stdout/stderr 문제도 원천 차단
      stdio: 'ignore',
    });
  } else {
    const backendScript = path.join(__dirname, '..', 'backend', 'app.py');
    proc = spawn('python', [backendScript], {
      cwd: path.join(__dirname, '..', 'backend'),
      env: backendEnv,
      detached: false,
      stdio: 'ignore',
    });
  }

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
  await startBackend();
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

// window-all-closed와 before-quit 두 곳에서 모두 처리
app.on('window-all-closed', () => {
  killBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  killBackend();
});

// 예기치 않은 종료 시에도 백엔드 정리
process.on('exit', () => killBackend());
process.on('SIGINT', () => { killBackend(); process.exit(0); });
process.on('SIGTERM', () => { killBackend(); process.exit(0); });

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return result.canceled ? [] : result.filePaths;
});
