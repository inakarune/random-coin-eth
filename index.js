const { app, BrowserWindow, ipcMain } = require('electron')

const url = `file://${__dirname}/dist/index.html`;
let win, loginWin;
function createWindow() {
    win = new BrowserWindow({
        width: 390,
        height: 464,
        webPreferences: {
            nodeIntegration: true
        },
        show: false,
        frame: false,
        transparent: true
    });
    loginWin = new BrowserWindow({
        parent: win,
        show: false,
        frame: false,
        width: 400,
        height: 235,
        resizable: false,
        movable:true,
        center: true,
        transparent: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // win.webContents.openDevTools();
    win.loadURL(`${ url }`);

    // loginWin.webContents.openDevTools();
    loginWin.once('ready-to-show', () => {
        loginWin.show();
    });
    loginWin.loadURL(`${ url }#login`);
    loginWin.setMenu(null);
}

app.on('ready', createWindow);
ipcMain.on('showAfterLogin', (event, arg) => {
    loginWin.close();
    win.show();
    win.webContents.send('store-data', arg);
});
ipcMain.on('exit', () => {
	win = null;
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
