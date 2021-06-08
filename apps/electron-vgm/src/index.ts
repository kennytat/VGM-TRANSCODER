import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { exec, execFile, spawn } from 'child_process'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './graphql/app.module'

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


// create graphql server function
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000, () => {
    console.log(`
🚀 Server ready at: http://localhost:3000/graphql
⭐️ See sample queries: http://pris.ly/e/ts/graphql-nestjs#using-the-graphql-api
`)
  })
}
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
// get graphql server ready before creating electron window
  bootstrap();
// start creating electron window
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
    mainWindowSettings.minWidth = 800;
    mainWindowSettings.minHeight = 600; 
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
  ipcMain.on('open-file-dialog', (event, isfile) => {
    let options = {};
    if (isfile === true) {
      options = {
        title: 'Browse Video Folder',
        filters: [{ name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }],
        properties: ['openFile','multiSelections']
      }
    } else {
      options = {
        title: 'Browse Video Folder',
        properties: ['openDirectory']
      }
    }
    dialog.showOpenDialog(win,options).then(result => {
    event.sender.send('directory-path', result.filePaths)
  }).catch(err => {console.log(err)});
  })

  ipcMain.on('save-dialog', (event) => {
    dialog.showOpenDialog(win,{
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

  // Get input and output path from above and execute sh file
  ipcMain.on('start-convert', (event, argInPath, argOutPath, fileOnly) => {
    // Declare variable for calculate conversion rate
    let totalFiles:number = 0;
    let convertedFiles:number = 0;
    let progression_status:number = 0;
    let ffprobe_frame_stat = [];
    let ffmpeg_progress_stat = [];
    let isFile = '';
    // Get input and output path
    let inPath = '\"'+argInPath.join()+'\"';
    let outPath = '\"'+argOutPath+'\"';
    // Get total input file count 
    if (fileOnly === true) {
      totalFiles = argInPath.length;
      isFile = "isFile";
      startConvert();
    } else {
      isFile = "isFolder";
      let count_files_arg = "find " + inPath + " -regextype posix-extended -regex '.*.(mkv|mp4)' | wc -l";
      const count_files_exec = spawn('sh', ['-c', count_files_arg]);
      count_files_exec.stdout.on('data', data => {totalFiles = parseInt(data);})
      count_files_exec.on('close', (code) => {startConvert();});
    }
    function startConvert() {
      if (totalFiles > 0) {
        // Run ffmpeg to start convert
        execFile('./ffmpeg-exec.sh', [inPath, outPath, isFile], (error, stdout, stderr) => {
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
            console.log(`Stdout123: ${stdout}`);
          };
          event.sender.send('exec-done');
        });

        // Run interval to read progression while ffmpeg is running
        let interval = setInterval(() => {
          // read ffmpeg-progress.txt 500ms repeatedly, get fps and duration
          ffprobe_frame_stat = fs.readFileSync("".concat(argOutPath,'/.ffprobe-frame.txt'),{encoding:'utf8', flag:'r'}).toString().split("\n");
          // read ffmpeg-progress.txt 500ms repeatedly, get current converted frames
          ffmpeg_progress_stat = fs.readFileSync("".concat(argOutPath,'/.ffmpeg-progress.txt'),{encoding:'utf8', flag:'r'}).toString().split("\n");
          
          // get total frames
          let total_frames = 0;
          let converted_frames_num = 0;
          if (ffprobe_frame_stat !== [] && ffmpeg_progress_stat !== []) {
            // get fps and total duration
            let fps_stat = ffprobe_frame_stat.filter(name => name.includes("avg_frame_rate=")).toString();
            let duration_stat = ffprobe_frame_stat.filter(name => name.includes("duration=")).toString();
            if (fps_stat !== null && duration_stat !== null) {
            let fps = parseInt(fps_stat.match(/\d+/g)[0])/parseInt(fps_stat.match(/\d+/g)[1]);
            let duration = parseFloat(duration_stat.match(/\d+\.\d+/)[0]);
            // calculate total frames
            total_frames = Math.round(duration*fps);
            }
            // get current progress status, if total converted frames = total frames, then convertedFiles++  
            convertedFiles = parseInt(ffprobe_frame_stat[0]); 
            // get current converted frames
            let converted_frames = ffmpeg_progress_stat.filter(name => name.includes("frame=")).pop();
            if (converted_frames !== undefined) {converted_frames_num = parseInt(converted_frames.match(/\d+/)[0])};
            // get conversion progression in rate
            if (converted_frames_num !== 0 && total_frames !== 0 && totalFiles !== 0) {
              progression_status = (convertedFiles+converted_frames_num/total_frames)/totalFiles;
            }  
            event.sender.send('progression', progression_status, convertedFiles, totalFiles);
          }   
        }, 500);
    } else {
      dialog.showMessageBox(null, {
        type: 'warning',
        title: 'Warning',
        message: 'No video found',
        detail: 'No valid video files found, please try again.',
      }).then( result => {
          console.log(result.response);
          console.log(result.checkboxChecked);
        }).catch(err => {console.log(err)});
      event.sender.send('exec-done');
    }
    }
    
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


 