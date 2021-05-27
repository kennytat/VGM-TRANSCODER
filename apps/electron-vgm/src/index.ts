import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
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
    dialog.showMessageBox(null, {
      type: 'warning',
      title: 'Warning',
      message: 'Invalid input or output path',
      detail: 'Please select valid input source and output destination.',
    }).then( result => {
        console.log(result.response);
        console.log(result.checkboxChecked);
      }).catch(err => {console.log(err)});
  })


  ipcMain.on('test', (event, arg) => {
    let testread;
    fs.readFile('ffprobe-frame.txt','utf8', (err, data) => {
      if (err) {console.log(err)}
      else {
        testread = data.split("\n");
        console.log(testread);     
      }
    });
  })




  // Get input and output path from above and execute sh file
  ipcMain.on('start-convert', (event, args) => {
    // Declare variable for calculate conversion rate
    let totalFiles:number;
    let convertedFiles:number = 0;
    let progression_status:number;
    // Get input and output path
    let inPath = args[0]; 
    let outPath;
    if (args[1] == "") {
      outPath = args[0];
    } else {
      outPath = args[1];
    } 
    // Get total input file count 
    let count_files_arg = "find " + inPath + " -name *.mkv -type f | wc -l";
    const test = spawn('sh', ['-c', count_files_arg]);
    test.stdout.on('data', data => {
      totalFiles = parseInt(data);
    })

    // Run interval to read progression while ffmpeg is running
    let interval = setInterval(() => {
      // read ffmpeg-progress.txt 500ms repeatedly, get fps and duration
      let ffprobe_frame_stat = fs.readFileSync('ffprobe-frame.txt',{encoding:'utf8', flag:'r'}).toString().split("\n");
      // read ffmpeg-progress.txt 500ms repeatedly, get current converted frames
      let ffmpeg_progress_stat = fs.readFileSync('ffmpeg-progress.txt',{encoding:'utf8', flag:'r'}).toString().split("\n");
      
      // get total frames
      let total_frames = 0;
      if (ffprobe_frame_stat !== undefined) {
        // get fps
        let fps_stat = ffprobe_frame_stat.filter(name => name.includes("avg_frame_rate=")).toString();
        let fps = parseInt(fps_stat.match(/\d+/g)[0])/parseInt(fps_stat.match(/\d+/g)[1]);
        // get total duration
        let duration_stat = ffprobe_frame_stat.filter(name => name.includes("duration=")).toString();
        let duration = parseFloat(duration_stat.match(/\d+\.\d+/)[0]);
        // calculate total frames
        total_frames = Math.floor(duration*fps);
      }
      // get current converted frames
      let converted_frames_num = 0;
      if (ffmpeg_progress_stat !== undefined) { 
        let converted_frames = ffmpeg_progress_stat.filter(name => name.includes("frame=")).pop();
        converted_frames_num = parseInt(converted_frames.match(/\d+/)[0]);
      }
         
      // get conversion progression in rate
      if (converted_frames_num !== 0 && total_frames !== 0 && totalFiles !== 0) {
        progression_status = (convertedFiles+converted_frames_num/total_frames)/totalFiles;
      }  
      // get current progress status, if total converted frames = total frames, then convertedFiles++  
      if (converted_frames_num === total_frames) {convertedFiles++;}; 
      event.sender.send('progression', progression_status, convertedFiles, totalFiles);

      console.log(total_frames);
      console.log(converted_frames_num);
      console.log(progression_status);
      console.log(convertedFiles);

    }, 500);

    // Run ffmpeg to start convert
    execFile('./ffmpeg-exec.sh', [inPath, outPath], (error, stdout, stderr) => {
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
          clearInterval(interval);
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
          clearInterval(interval);
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
          clearInterval(interval);
        console.log(`Stdout: ${stdout}`);
      };
      event.sender.send('exec-done');
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
            detail: 'Your conversion have been cancelled.',
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


 