import { app, BrowserWindow, ipcMain, screen, dialog, Menu, globalShortcut } from 'electron'
import * as path from 'path'
import * as url from 'url'
import { exec, spawn, execSync } from 'child_process'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './graphql/app.module'


let serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === '--serve');

const { create, globSource } = require('ipfs-http-client')
let ipfsClient;
let ipfsInfo;
interface FileInfo {
  localpath: string,
  filename: string,
  size: number,
  duration: number,
  qm: string
}

let win: Electron.BrowserWindow = null;
let menu: Electron.Menu;
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

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
    {
      role: 'help',
      submenu: [{
        label: 'Learn More',
        click() {
          require('electron').shell.openExternal('https://www.vgm.tv');
        }
      }]
    }
  ];
  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
/**
 * Create main window presentation
 */
function createWindow() {
  // get graphql server ready before creating electron window
  bootstrap();
  // start creating electron window
  const sizes = screen.getPrimaryDisplay().workAreaSize;
  mainWindowSettings.width = 1100;
  mainWindowSettings.height = 800;
  mainWindowSettings.x = (sizes.width - 1100) / 2;
  mainWindowSettings.y = (sizes.height - 800) / 2;

  if (debugMode) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
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
  // register macos cmd+Q shortcut for quitting
  if (process.platform === 'darwin') {
    globalShortcut.register('Command+Q', () => {
      app.quit();
    })
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
  app.on('ready', () => {
    createWindow();
    createMenu();
  });

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

  ipcMain.on('connect-ipfs', async (event, isConnected, ipfs) => {
    if (!isConnected) {
      ipfsInfo = ipfs;
      exec(`docker image inspect ${ipfs.image}`, (error, stdout, stderr) => {
        if (stdout) {
          const cmd =
            `docker run --name ${ipfs.container} \\
            -p ${ipfs.swarmPort}:${ipfs.swarmPort} \\
            -p ${ipfs.swarmPort}:${ipfs.swarmPort}/udp \\
            -p ${ipfs.host}:${ipfs.gatewayPort}:${ipfs.gatewayPort} \\
            -p ${ipfs.host}:${ipfs.apiPort}:${ipfs.apiPort} --rm --privileged \\
          -e 'AWSACCESSKEYID=${ipfs.accessKey}' \\
          -e 'AWSSECRETACCESSKEY=${ipfs.secretKey}' \\
          -e 'ENDPOINT_URL=${ipfs.endPoint}' \\
          -e 'S3_BUCKET=${ipfs.bucket}' \\
          -e 'MOUNT_POINT=/var/s3' \\
          -e 'IAM_ROLE=none' \\
          -i ${ipfs.image}`;

          let child = spawn('sh', ['-c', cmd], { detached: true });
          child.stdout.on('data', (data) => {
            event.sender.send('ipfs-response', true, data.toString())
          })
          child.stderr.on('data', (data) => {
            const options = {
              type: 'warning',
              title: 'Warning',
              message: 'IPFS connection error',
              detail: data.toString()
            };
            showMessageBox(options);
          })
        } else {
          const options = {
            type: 'warning',
            title: 'Warning',
            message: 'IPFS Docker connection error',
            detail: error.toString() || stderr.toString(),
          };
          showMessageBox(options);
        }
      })

    } else {
      exec(`docker kill ${ipfs.container}`, (error, stdout, stderr) => {
        if (stdout) {
          event.sender.send('ipfs-response', false, stdout)
        } else {
          const options = {
            type: 'warning',
            title: 'Warning',
            message: 'IPFS Docker Error',
            detail: error.toString() || stderr.toString(),
          };
          showMessageBox(options);
        }
      })

    }


  })

  ipcMain.on('ipfs-ready', async (event, httpApiConfig) => {
    ipfsClient = await create(httpApiConfig);

  })

  // Listen to renderer process and open dialog for input and output path
  ipcMain.on('open-file-dialog', (event, isfile) => {
    let options = {};
    if (isfile === true) {
      options = {
        title: 'Browse Video Folder',
        filters: [{ name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] }],
        properties: ['openFile', 'multiSelections']
      }
    } else {
      options = {
        title: 'Browse Video Folder',
        properties: ['openDirectory']
      }
    }
    dialog.showOpenDialog(win, options).then(result => {
      event.sender.send('directory-path', result.filePaths)
    }).catch(err => { console.log(err) });
  })

  ipcMain.on('save-dialog', (event) => {
    dialog.showOpenDialog(win, {
      title: 'Browse Output Folder',
      properties: ['openDirectory']
    }).then(result => {
      event.sender.send('saved-path', result.filePaths)
    }).catch(err => { console.log(err) });
  })

  ipcMain.on('error-message', (event, arg) => {
    if (arg === 'missing-path') {
      const options = {
        type: 'warning',
        title: 'Warning',
        message: 'Invalid input/output or database',
        detail: 'Please select valid source, destination and database',
      };
      showMessageBox(options);
    } else if (arg === 'empty-select') {
      const options = {
        type: 'warning',
        title: 'Warning',
        message: 'No file selected',
        detail: 'Select file to be modified, please try again',
      };
      showMessageBox(options);
    }
  })

  // Show message box function
  function showMessageBox(options) {
    dialog.showMessageBox(null, options).then(result => {
      console.log(result.response);
    }).catch(err => { console.log(err) });
  }

  // Get input and output path from above and execute sh file
  ipcMain.on('start-convert', (event, argInPath, argOutPath, fileOnly) => {
    let files: string[];
    let totalFiles: number = 0;
    let convertedFiles: number = 0;
    let progression_status: number = 0;
    // Get total input file count 
    if (fileOnly) {
      files = argInPath;
    } else {
      files = execSync(`find ${argInPath} -regextype posix-extended -regex '.*.(mkv|mp4)'`, { encoding: "utf8" }).split('\n');
    }
    totalFiles = files.length;
    if (totalFiles > 0 && convertedFiles < totalFiles) {
      startConvert(files, 0);
    } else {
      const options = {
        type: 'warning',
        title: 'Warning',
        message: 'No video found',
        detail: 'No valid video files found, please try again.',
      };
      showMessageBox(options);
      event.sender.send('exec-done');
    }


    async function startConvert(files: string[], index: number) {
      let fileInfo: FileInfo;
      let metaData: any = [];
      let filePath: string = 'hello';
      // get file Info
      metaData = await execSync(`ffprobe -v quiet -select_streams v:0 -show_entries format=filename,duration,size,stream_index:stream=avg_frame_rate -of default=noprint_wrappers=1 "${files[index]}"`, { encoding: "utf8" }).split('\n');
      // Then run ffmpeg to start convert
      const fps_stat: string = metaData.filter(name => name.includes("avg_frame_rate=")).toString();
      const duration_stat: string = metaData.filter(name => name.includes("duration=")).toString();
      fileInfo.duration = parseFloat(duration_stat.match(/\d+\.\d+/)[0]);
      fileInfo.localpath = metaData.filter(name => name.includes("filename=")).toString().replace('filename=', '');
      fileInfo.size = parseInt(metaData.filter(name => name.includes("size=")).toString().replace('size=', ''));
      fileInfo.filename = fileInfo.localpath.replace(/\s/g, '_').match(/\/[\w\-\_]+\.[a-z0-9]+$/gi)[0]

      const conversion = await spawn('./ffmpeg-exec.sh', [`"${files[index]}"`, `"${argOutPath}"`]);
      conversion.stdout.on('data', async (data) => {
        // console.log(`conversion stdout: ${data}`, totalFiles, convertedFiles);
        const ffmpeg_progress_stat: string[] = data.toString().split('\n');
        if (ffmpeg_progress_stat) {
          // get fps and total duration
          const converted_frames: string = ffmpeg_progress_stat.filter(name => name.includes("frame=")).pop();

          if (fps_stat && duration_stat && converted_frames) {
            const fps: number = parseInt(fps_stat.match(/\d+/g)[0]) / parseInt(fps_stat.match(/\d+/g)[1]);
            const duration: number = parseFloat(duration_stat.match(/\d+\.\d+/)[0]);
            // calculate total frames
            if (fps && duration) {
              const total_frames: number = Math.round(duration * fps);
              const converted_frames_num: number = parseInt(converted_frames.match(/\d+/)[0])
              if (converted_frames_num && total_frames) {
                progression_status = converted_frames_num / total_frames;
              }
            }
          }
          event.sender.send('progression', progression_status, convertedFiles, totalFiles);
        }

      });

      conversion.stderr.on('data', async (data) => {
        const options = {
          type: 'warning',
          title: 'Stderror',
          message: 'Error converting files',
          detail: 'None expected standard errors occured, please try again.',
        };
        showMessageBox(options);
        event.sender.send('exec-done');
        console.log(`Stderr: ${data}`);
      });

      conversion.on('close', async (code) => {
        if (code === 0) {
          if (ipfsClient) {
            const ipfsOut: any = await ipfsClient.add(globSource('/home/kennytat/Desktop/BigBuck', { recursive: true }));
            fileInfo.qm = ipfsOut.cid.replace(/^CID\(|\)/, '');
            fileInfo.size = ipfsOut.size;
            fileInfo.filename = ipfsOut.path;
          }

          event.sender.send('create-database', fileInfo);
          convertedFiles++;
          if (convertedFiles === totalFiles) {
            const options = {
              type: 'info',
              title: 'Done',
              message: 'Congratulations',
              detail: 'Your files have been converted sucessfully',
            };
            showMessageBox(options);
            event.sender.send('exec-done');
          } else {
            startConvert(files, index + 1);
          }
        }
        console.log(`child process exited with code ${code}`, convertedFiles);
      });


    }



  })




  // Stop conversion process when button onclick
  ipcMain.on('stop-convert', (event) => {
    //get ffmpeg-exec.sh PID and run command to kill it then kill ffmpeg
    let child = spawn('pgrep', ['-f', 'ffmpeg-exec.sh'], { detached: true });
    child.stdout.on('data', (data) => {
      let ffmpeg_bash_pid = data.toString().trim();
      let killcmd = `kill ${ffmpeg_bash_pid} && killall ffmpeg`;
      exec(killcmd, (error, stdout, stderr) => {
        if (error) {
          console.log(`Error: ${error}`);
          const options = {
            type: 'error',
            title: 'Error',
            message: 'Error cancelling conversion',
            detail: 'None expected errors occured, please try again.',
          };
          showMessageBox(options);
        } else if (stderr) {
          console.log(`Stderr: ${stderr}`);
          const options = {
            type: 'error',
            title: 'Error',
            message: 'Error cancelling conversion',
            detail: 'None expected standard errors occured, please try again.',
          };
          showMessageBox(options);
        } else {
          console.log(`Stdout: ${stdout}`);
          const options = {
            type: 'info',
            title: 'Done',
            message: 'Cancellation',
            detail: 'Your conversion have been cancelled.',
          };
          showMessageBox(options);
        }
      });
    });
    child.stderr.on('data', (data) => { console.log(`stderr: ${data}`) });
    child.on('error', (error) => { console.log(`error: ${error}`) });
    child.on('exit', (code, signal) => {
      if (code) console.log(`Process exit with code: ${code}`)
      if (signal) console.log(`Process killed with signal: ${signal}`)
      console.log(`Done ✅`)
    });
  })




  ipcMain.on('test', async (event) => {
    const config = ipfsClient.getEndpointConfig();
    console.log(config);
    const cid: any = await ipfsClient.add('Hello world')
    console.log(cid);
    // const ci: any = await ipfsClient.add(globSource('/home/kennytat/Desktop/BigBuck', { recursive: true }))
    // console.log(ci);

    const ci: any = await ipfsClient.add(globSource('/home/kennytat/Desktop/testfolder', { recursive: true }))
    console.log(ci);
    // console.log(arg);


  })



  ipcMain.on('exec-db-confirmation', (event, method) => {
    let options;
    if (method === 'newDB') {
      options = {
        type: 'question',
        buttons: ['Cancel', 'Create'],
        defaultId: 0,
        title: 'Create Data Confirmation',
        message: 'Are you sure want to create selected entries',
        detail: 'Create new data will also publish it on IPFS',
      }
    } else if (method === 'updateDB') {
      options = {
        type: 'question',
        buttons: ['Cancel', 'Update'],
        defaultId: 0,
        title: 'Update Confirmation',
        message: 'Are you sure want to update selected entries',
        detail: 'Update data will also update it on IPFS',
      }
    } else if (method === 'deleteDB') {
      options = {
        type: 'question',
        buttons: ['Cancel', 'Delete data and keep files', 'Delete data and files'],
        defaultId: 0,
        title: 'Deletion Confirmation',
        message: 'Are you sure want to delete selected entries',
        detail: 'Delete data will also unpublish it on IPFS',
      }
    }
    dialog.showMessageBox(win, options).then(result => {
      event.sender.send('exec-confirm-message', method, result.response);
    }).catch(err => { console.log(err) });
  })


  ipcMain.on('exec-db-done', (event, message) => {
    const options = {
      type: 'info',
      title: 'Done',
      message: 'Your request have been executed sucessfully!',
      detail: message,
    };
    showMessageBox(options);
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (err) { }

function quit() {
  exec(`docker kill ${ipfsInfo.container}`, (error, stdout, stderr) => { console.log('kill ipfs container') })
  if (process.platform !== 'darwin') {
    app.quit();
  }
}


