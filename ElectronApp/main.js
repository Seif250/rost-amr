const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#f7eee4',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'لوحة تحكم ابن حلال',
    icon: path.join(__dirname, 'icon.png'), // ضع أيقونة هنا إذا أردت
  });

  // أثناء التطوير: استخدم dev server
  // win.loadURL('http://localhost:3000/daily-summary');

  // للإنتاج: استخدم ملفات build
  win.loadFile(path.join(__dirname, '../Frontend/dist/index.html'));

  // افتح الروابط الخارجية في المتصفح الافتراضي
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
