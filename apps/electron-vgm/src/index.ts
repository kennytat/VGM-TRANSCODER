import { app, BrowserWindow, ipcMain, screen, dialog, Menu, globalShortcut } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { exec, spawn, execSync } from 'child_process'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './graphql/app.module'
import { create, globSource, CID } from 'ipfs-http-client'
import * as CryptoJS from "crypto-js";
import { slice } from 'ramda';

import * as M3U8FileParser from "m3u8-file-parser";
import * as bitwise from 'bitwise';



let serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === '--serve');

let ipfsClient;
let ipfsInfo;
interface FileInfo {
  pid: string,
  location: string,
  name: string,
  size: number,
  duration: string,
  qm: string,
  url: string,
  hash: string,
  isVideo: boolean,
  dblevel: number
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
    if (ipfs.host === '127.0.0.1') {
      if (!isConnected) {
        ipfsInfo = ipfs;
        exec(`docker image inspect ${ipfs.image}`, (error, stdout, stderr) => {
          if (stdout) {
            exec(`docker container inspect ${ipfs.container}`, (error, stdout, stderr) => {
              if (stderr || error) {
                const cmd =
                  `docker run --name ${ipfs.container} \\
            -p ${ipfs.swarmPort}:4001 \\
            -p ${ipfs.swarmPort}:4001/udp \\
            -p ${ipfs.host}:${ipfs.gatewayPort}:8080 \\
            -p ${ipfs.host}:${ipfs.apiPort}:5001 --rm --privileged \\
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
              } else if (stdout) {
                event.sender.send('ipfs-response', true, 'Connected to local IPFS daemon')
              }
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
        exec(`docker container inspect ${ipfs.container}`, (error, stdout, stderr) => {
          if (stdout) {
            exec(`docker kill ${ipfs.container}`, (error, stdout, stderr) => {
              if (stdout) {
                event.sender.send('ipfs-response', false, `Local IPFS Container ${stdout.toString()} has been killed`)
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
      }
    } else {
      exec(`curl -X POST ${ipfs.host}/api/v0/id`, (error, stdout, stderr) => {
        const id = JSON.parse(stdout);
        if (id.ID) {
          console.log('ipfs gateway connection ready');
          event.sender.send('ipfs-response', true, 'Connected to IPFS gateway daemon')
        } else {
          console.log('ipfs gateway connection fail');
          event.sender.send('ipfs-response', false, 'IPFS Gateway HTTP API Connection Error')
        }
      })
    }
  })

  ipcMain.on('ipfs-ready', async (event, httpApiConfig) => {
    ipfsClient = await create(httpApiConfig);
  })

  // Listen to renderer process and open dialog for input and output path
  ipcMain.handle('open-dialog', (event, isfile) => {
    let options = {};
    if (isfile === true) {
      options = {
        title: 'Browse Video Folder',
        filters: [{ name: 'Media', extensions: ['mkv', 'avi', 'mp4', 'm4a', 'mp3', 'wav', 'wma', 'aac', 'webm'] }],
        properties: ['openFile', 'multiSelections']
      }
    } else {
      options = {
        title: 'Browse Video Folder',
        properties: ['openDirectory']
      }
    }
    const result = dialog.showOpenDialog(win, options).then(result => {
      return result.filePaths;
    }).catch(err => { console.log(err) });
    return result
  })

  ipcMain.handle('save-dialog', async (event, type?) => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Browse Output Folder',
      properties: ['openDirectory']
    }).then(result => {
      return result.filePaths;
    }).catch(err => { console.log(err) });
    if (type === 'api') {
      fs.mkdirSync(`${result[0]}/API/items/list`, { recursive: true });
      fs.mkdirSync(`${result[0]}/API/items/single`, { recursive: true });
      fs.mkdirSync(`${result[0]}/API/topics/list`, { recursive: true });
      fs.mkdirSync(`${result[0]}/API/topics/single`, { recursive: true });
    }
    return result
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
    } else if (arg === 'topic-db-error') {
      const options = {
        type: 'warning',
        title: 'Warning',
        message: 'Error creating new topic',
        detail: 'Existing topic or server error',
      };
      showMessageBox(options);
    }
  })

  // Get input and output path from above and execute sh file
  ipcMain.on('start-convert', (event, argInPath, argOutPath, fileOnly, pItem) => {
    let files: string[];
    let totalFiles: number = 0;
    let convertedFiles: number = 0;
    let progression_status: number = 0;
    let fileType: string;
    // Get total input file count 
    if (fileOnly) {
      files = argInPath;
    } else {
      files = execSync(`find ${argInPath} -regextype posix-extended -regex '.*.(mkv|mp4)'`, { encoding: "utf8" }).split('\n');
      files.pop();
    }
    totalFiles = files.length;
    if (totalFiles > 0 && convertedFiles < totalFiles) {
      if (pItem.isVideo) {
        fileType = 'video';
      } else {
        fileType = 'audio';
      }
      startConvert(files, 0, fileType);
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


    async function startConvert(files: string[], index: number, fileType: string) {
      let fileInfo: FileInfo = { pid: '', location: '', name: '', size: 0, duration: '', qm: '', url: '', hash: '', isVideo: false, dblevel: 0 };
      let metaData: any = [];
      // get file Info
      metaData = await execSync(`ffprobe -v quiet -select_streams v:0 -show_entries format=filename,duration,size,stream_index:stream=avg_frame_rate -of default=noprint_wrappers=1 "${files[index]}"`, { encoding: "utf8" }).split('\n');
      // Then run ffmpeg to start convert
      const duration_stat: string = metaData.filter(name => name.includes("duration=")).toString();
      const duration: number = parseFloat(duration_stat.replace(/duration=/g, ''));
      const minutes: number = Math.floor(duration / 60);
      fileInfo.duration = `${minutes}:${Math.floor(duration) - (minutes * 60)}`;
      fileInfo.size = parseInt(metaData.filter(name => name.includes("size=")).toString().replace('size=', ''));
      const nameExtPath = files[index].match(/[\w\-\_\(\)\s]+\.[\w\S]{3,4}$/gi).toString();
      fileInfo.name = nameExtPath.replace(/\.\w+/g, '');
      const nonVietnamese = nonAccentVietnamese(fileInfo.name);
      fileInfo.url = `${pItem.url}.${nonVietnamese.toLowerCase().replace(/[\W\_]/g, '-')}`;
      fileInfo.location = `${pItem.location}/${nonVietnamese.replace(/\s/, '')}`;
      const outPath = `${argOutPath}/${nonVietnamese.replace(/\s/, '')}`;
      fileInfo.isVideo = pItem.isVideo;
      fileInfo.pid = pItem.id;
      fileInfo.dblevel = pItem.dblevel + 1;
      const conversion = await spawn('./ffmpeg-exec.sh', [`"${files[index]}"`, `"${outPath}"`, fileType]);

      conversion.stdout.on('data', async (data) => {
        // console.log(`conversion stdout: ${data}`, totalFiles, convertedFiles);
        const ffmpeg_progress_stat: string[] = data.toString().split('\n');
        if (ffmpeg_progress_stat && fileType === 'video') {
          // get fps and total duration
          const fps_stat: string = metaData.filter(name => name.includes("avg_frame_rate=")).toString();
          const converted_frames: string = ffmpeg_progress_stat.filter(name => name.includes("frame=")).toString();
          if (fps_stat && duration_stat && converted_frames) {
            const fps: number = parseInt(fps_stat.match(/\d+/g)[0]) / parseInt(fps_stat.match(/\d+/g)[1]);
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
        } else if (ffmpeg_progress_stat && fileType === 'audio') {
          // get converted time
          const time_stat: string = ffmpeg_progress_stat.filter(time => time.includes('out_time_ms=')).toString();
          if (time_stat && duration_stat) {
            const converted_time: number = parseInt(time_stat.replace(/[(out_time_ms=)\.]/g, ''));
            const audio_duration: number = parseInt(duration_stat.replace(/[(duration=)\.]/g, ''));
            // calculate progress
            if (converted_time && audio_duration) {
              progression_status = converted_time / audio_duration;
            }
          }
          event.sender.send('progression', progression_status, convertedFiles, totalFiles);
        }

      });



      conversion.stderr.on('data', async (data) => {
        const options = {
          type: 'warning',
          title: 'Stderror',
          message: data.toString(),
          detail: 'None expected standard errors occured, please try again.',
        };
        showMessageBox(options);
        event.sender.send('exec-done');
        console.log(`Stderr: ${data}`);
      });

      conversion.on('close', async (code) => {
        if (code == 0) {
          // encrypt m3u8 key
          try {
            // get iv info
            const reader = new M3U8FileParser();
            const segment = fs.readFileSync(`${outPath}/480p.m3u8`, { encoding: 'utf-8' });
            reader.read(segment);
            const m3u8 = reader.getResult();
            const secret = `VGM-${m3u8.segments[0].key.iv.slice(0, 6).replace("0x", "")}`;
            // get buffer from key and iv
            const code = Buffer.from(secret);
            const key: Buffer = await fs.readFileSync(`${outPath}/key.vgmk`);
            const encrypted = bitwise.buffer.xor(key, code, false);
            fs.writeFileSync(`${outPath}/key.vgmk`, encrypted, { encoding: 'binary' })
          } catch (error) {
            console.log('encrypt key error:', error);
          }
          // upload ipfs
          if (ipfsClient) {
            try {
              const ipfsOut: any = await ipfsClient.add(globSource(outPath, { recursive: true }));
              const cid: CID = ipfsOut.cid;
              console.log(cid);
              fileInfo.qm = cid.toString();
              const secretKey = slice(0, 32, `${fileInfo.url}gggggggggggggggggggggggggggggggg`);
              fileInfo.hash = CryptoJS.AES.encrypt(fileInfo.qm, secretKey).toString();
              fileInfo.size = ipfsOut.size;
              console.log(fileInfo);
              event.sender.send('create-database', fileInfo);
            } catch (err) {
              console.log('ipfs add error', err);
            }
          } else {
            event.sender.send('create-database', fileInfo);
          }
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
            startConvert(files, index + 1, fileType);
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


  ipcMain.on('test', async (event, url: string) => {


    try {
      // get iv info
      const reader = new M3U8FileParser();
      const segment = fs.readFileSync(`${url}/480p.m3u8`, { encoding: 'utf-8' });
      reader.read(segment);
      const m3u8 = reader.getResult();
      const secret = `VGM-${m3u8.segments[0].key.iv.slice(0, 6).replace("0x", "")}`;
      // get buffer from key and iv
      const code = Buffer.from(secret);

      const key: Buffer = await fs.readFileSync(`${url}/key.vgmk`);
      const encrypted = bitwise.buffer.xor(key, code, false);
      console.log(key, '\n', code, '\n', encrypted);


      const codeArray = new Uint8Array(code);
      const keyArray = new Uint8Array(key);
      const newKeyArray = new Uint8Array(encrypted);

      console.log(keyArray, codeArray, newKeyArray);
      fs.writeFileSync(`${url}/key.vgmk`, encrypted, { encoding: 'binary' })
    } catch (error) {
      console.log('encrypt key error:', error);

    }



    // ipfsClient = create({
    //   url: 'http://ipfs.hjm.bid',
    //   port: 80,
    //   protocol: 'http',
    //   apiPath: '/api/v0'
    // });
    // const config = ipfsClient.getEndpointConfig();
    // console.log(config);
    // const ipfsout = await ipfsClient.add('Hello world')
    // const cid: CID = ipfsout.cid;
    // console.log(cid);
    // console.log(cid.toString());


    // try {
    //   const now = new Date();
    //   const timenow = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    //   console.log(timenow);
    //   const test = await ipfsClient.add('Hello world');
    //   console.log(test);
    //   const ci = await ipfsClient.add(globSource('/home/kennytat/Desktop/master', { recursive: true }));
    //   console.log(ci);
    //   const later = new Date();
    //   const timelater = later.getHours() + ":" + later.getMinutes() + ":" + later.getSeconds();
    //   console.log(timelater);
    // } catch (err) {
    //   console.log('error QmSjZekBS7RRnq7Bk94uJQYjafkZi7aczPwbQiE8A9eLxQ', err);
    // }


    // const ci: any = await ipfsClient.add(globSource('/home/kennytat/Desktop/testfolder', { recursive: true }))
    // console.log(ci);
    // console.log(arg);
    // const id = await ipfsClient.id();
    // console.log(id);
    // const online = await ipfsClient.isOnline();
    // console.log(online)
    // const ipfsOut: any = await ipfsClient.add('hello world');
    // console.log(ipfsOut);
    // if (ipfsOut) {
    //   const cid: CID = ipfsOut.cid;
    //   console.log(cid);
    // }



    // const secretKey = slice(0, 32, 'jashdkfhjkahj4350pdfvkhdv');
    // const test = CryptoJS.AES.encrypt('fileInfo.qm', secretKey).toString();
    // console.log('test called');
    // // export json for meiliSeasrch from multiple json files
    // let meiliSearch: any = [];
    // const apiFolder = '/home/kennytat/Desktop/vgm/API/items/single';
    // fs.promises.readdir(apiFolder).then(files => {
    //   let i = 0;
    //   files.forEach(item => {
    //     fs.promises.readFile(`${apiFolder}/${item}`, { encoding: "utf8" }).then(result => {
    //       meiliSearch.push(JSON.parse(result));
    //       i++
    //       console.log(result, i);
    //       if (i === files.length) {
    //         const json: string = JSON.stringify(meiliSearch);
    //         fs.writeFile('/home/kennytat/Desktop/search.json', json, 'utf8', function (err) {
    //           if (err) throw err;
    //         });
    //       }
    //     }).catch(err => {
    //       console.log(err);
    //     })
    //   });
    // }).catch((error) => {
    //   console.log(error);
    // });


  })


  ipcMain.on('export-database', async (event, item, outpath, isLeaf) => {
    let path: string;
    let json: string;
    if (isLeaf === 'searchAPI') {
      path = `${outpath.toString()}/API/searchAPI.json`
      json = JSON.stringify(item);
    } else {
      json = JSON.stringify(item, null, 2);
    }
    if (isLeaf === 'isFile') {
      path = `${outpath.toString()}/API/items/single/${item.url}.json`
    } else if (isLeaf === 'isLeaf') {
      path = `${outpath.toString()}/API/items/list/${item.url}.json`
    } else if (isLeaf === 'nonLeaf') {
      path = `${outpath.toString()}/API/topics/single/${item.url}.json`
    }
    await fs.writeFile(path, json, function (err) {
      if (err) throw err;
    });

  })

  ipcMain.handle('exec-db-confirmation', async (event, method) => {
    let options;
    if (method === 'updateDB') {
      options = {
        type: 'question',
        buttons: ['Cancel', 'Update'],
        defaultId: 0,
        title: 'Update Confirmation',
        message: 'Are you sure want to update selected entries',
        detail: 'Update data will also update entries on network',
      }
    } else if (method === 'deleteDB') {
      options = {
        type: 'question',
        buttons: ['Cancel', 'Delete data'],
        defaultId: 0,
        title: 'Deletion Confirmation',
        message: 'Are you sure want to delete selected entries',
        detail: 'Delete data will also update entries on network',
      }
    }
    const result = dialog.showMessageBox(win, options).then(result => {
      return { method: method, response: result.response }
    }).catch(err => { console.log(err) });
    return result
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


  // Show message box function
  function showMessageBox(options) {
    dialog.showMessageBox(null, options).then(result => {
      console.log(result.response);
    }).catch(err => { console.log(err) });
  }

  // Rewrite vietnamese function
  function nonAccentVietnamese(str) {
    //     We can also use this instead of from line 11 to line 17
    //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
    //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
    //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
    //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
    //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
    //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
    //     str = str.replace(/\u0111/g, "d");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
  }

} catch (err) { }

function quit() {
  if (ipfsInfo) {
    exec(`docker container inspect ${ipfsInfo.container}`, (error, stdout, stderr) => {
      if (stdout) {
        exec(`docker kill ${ipfsInfo.container}`, (error, stdout, stderr) => { console.log(`ipfs container ${stdout} killed`) })
      }
    })
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
}


