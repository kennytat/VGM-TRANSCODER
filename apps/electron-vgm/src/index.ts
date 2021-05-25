import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { exec, execFile, spawn } from 'child_process';

let serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === '--serve');

let win: Electron.BrowserWindow = null;

const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
const debugMode = isEnvSet
  ? getFromEnv
  : process.defaultApp ||
    /node_modules[\\/]electron[\\/]/.test(process.execPath);

/**
 * Electron window settings
 */
const mainWindowSettings: Electron.BrowserWindowConstructorOptions = {
  frame: true,
  resizable: true,
  focusable: true,
  fullscreenable: true,
  kiosk: false,
  // to hide title bar, uncomment:
  // titleBarStyle: 'hidden',
  webPreferences: {
    devTools: debugMode,
    nodeIntegration: debugMode,
  },
};

/**
 * Hooks for electron main process
 */
function initMainListener() {
  ipcMain.on('ELECTRON_BRIDGE_HOST', (event, msg) => {
    console.log('msg received', msg);
    if (msg === 'ping') {
      event.sender.send('ELECTRON_BRIDGE_CLIENT', 'pong');
    }
  });
}

/**
 * Create main window presentation
 */
function createWindow() {
  const sizes = screen.getPrimaryDisplay().workAreaSize;

  if (debugMode) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

    mainWindowSettings.width = 800;
    mainWindowSettings.height = 600;
    mainWindowSettings.minWidth = 800;
    mainWindowSettings.minHeight = 600;
  } else {
    mainWindowSettings.width = sizes.width;
    mainWindowSettings.height = sizes.height;
    mainWindowSettings.x = 0;
    mainWindowSettings.y = 0;
  }

  win = new BrowserWindow(mainWindowSettings);

  let launchPath;
  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../../../node_modules/electron`),
    });
    launchPath = 'http://localhost:4200';
    win.loadURL(launchPath);
  } else {
    launchPath = url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    });
    win.loadURL(launchPath);
  }

  console.log('launched electron with:', launchPath);

  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  initMainListener();

  if (debugMode) {
    // Open the DevTools.
    win.webContents.openDevTools();
    // client.create(applicationRef);
  }
}

try {
  app.on('ready', createWindow);

  app.on('window-all-closed', quit);

  ipcMain.on('quit', quit);

  ipcMain.on('minimize', () => {
    win.minimize();
  });

  ipcMain.on('maximize', () => {
    win.maximize();
  });

  ipcMain.on('restore', () => {
    win.restore();
  });

// Listen to renderer process and open dialog for input and output path
  ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
      title: 'Browse Video Folder',
      properties: ['openDirectory']
  }).then(result => {
    event.sender.send('directory-path', result.filePaths)
  }).catch(err => {console.log(err)});
  })

  ipcMain.on('save-dialog', (event) => {
    dialog.showOpenDialog({
      title: 'Browse Output Folder',
      properties: ['openDirectory']
  }).then(result => {
    event.sender.send('saved-path', result.filePaths)
  }).catch(err => {console.log(err)});
  })

  ipcMain.on('missing-path', (event, arg) => {
    dialog.showErrorBox('Oops! Something went wrong!', 'Invalid input path or output path');
  })

  // Get input and output path from above and execute sh file
  ipcMain.on('start-convert', (event, arg) => {
    let inPath = arg[0]; 
    let outPath;
    if (arg[1] == "") {
      outPath = arg[0];
    } else {
      outPath = arg[1];
    } 
    execFile('./ffmpeg-exec.sh', [inPath, outPath], (error, stdout, stderr) => {
      console.log(`This process is pid ${process.pid}`);
      if (error) {
        dialog.showMessageBox(null, {
          type: 'error',
          title: 'Error',
          message: 'Error converting files',
          detail: 'None expected errors occured, please try again.',
        }).then( result => {
            console.log(result.response);
            console.log(result.checkboxChecked);
          }).catch(err => {console.log(err)});
          console.log(`Error: ${error}`); 
      } else if (stderr) {
        dialog.showMessageBox(null, {
          type: 'warning',
          title: 'Stderror',
          message: 'Error converting files',
          detail: 'None expected standard errors occured, please try again.',
        }).then( result => {
            console.log(result.response);
            console.log(result.checkboxChecked);
          }).catch(err => {console.log(err)});
        console.log(`Stderr: ${stderr}`);
      } else {
        dialog.showMessageBox(null, {
          type: 'info',
          title: 'Done',
          message: 'Congratulations',
          detail: 'Your files have been converted sucessfully',
        }).then( result => {
            console.log(result.response);
            console.log(result.checkboxChecked);
          }).catch(err => {console.log(err)});
        console.log(`Stdout: ${stdout}`);
      }
    });
  })

// Stop conversion process when button onclick
  ipcMain.on('stop-convert', (event) => {
    //get ffmpeg-exec.sh PID and run command to kill it then kill ffmpeg
    let child = spawn('pgrep', ['-f','ffmpeg-exec.sh'], {detached: true});
    child.stdout.on('data', (data) => {
      let ffmpeg_bash_pid = data.toString().trim();
      let killcmd = "kill " + ffmpeg_bash_pid + " &&" + " killall" + " ffmpeg"; 
      exec(killcmd, (error, stdout, stderr) => {
        if (error) {
          dialog.showMessageBox(null, {
            type: 'error',
            title: 'Error',
            message: 'Error cancelling conversion',
            detail: 'None expected errors occured, please try again.',
          }).then( result => {
              console.log(result.response);
              console.log(result.checkboxChecked);
            }).catch(err => {console.log(err)});
            console.log(`Error: ${error}`); 
        } else if (stderr) {
          dialog.showMessageBox(null, {
              type: 'error',
              title: 'Error',
              message: 'Error cancelling conversion',
              detail: 'None expected standard errors occured, please try again.',
          }).then( result => {
              console.log(result.response);
              console.log(result.checkboxChecked);
            }).catch(err => {console.log(err)});
          console.log(`Stderr: ${stderr}`);
        } else {
          dialog.showMessageBox(null, {
            type: 'info',
            title: 'Done',
            message: 'Cancellation',
            detail: 'Your conversion have been cancelled sucessfully.',
          }).then( result => {
              console.log(result.response);
              console.log(result.checkboxChecked);
            }).catch(err => {console.log(err)});
          console.log(`Stdout: ${stdout}`);
        }
      });
    });

    child.stderr.on('data', (data) => {console.log(`stderr: ${data}`)});
    child.on('error', (error) => {console.log(`error: ${error}`)});
    child.on('exit', (code, signal) => {
      if (code) console.log(`Process exit with code: ${code}`)
      if (signal) console.log(`Process killed with signal: ${signal}`)
      console.log(`Done ✅`) 
    });
  })

  

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (err) {}

function quit() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}


 