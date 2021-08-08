import { Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { videoClasses, videoTopics } from '../database/database.page';
import { Content, CREATE_CONTENT } from '../graphql.types';
import { Apollo } from 'apollo-angular';
import CryptoJS from "crypto-js";


type CreateContentResult = {
  createContent: {
    content: Content[];
  };
}

@Component({
  selector: 'vgm-converter',
  templateUrl: 'converter.page.html',
  styleUrls: ['converter.page.scss'],
})
export class ConverterPage implements OnInit {
  // Declare variable for GQL data
  videoClasses;
  videoTopics;

  selectedTopics;
  selectedClassID;
  selectedTopicID;
  // Declare variable for conversion feature
  inputPath: string | string[] = '';
  // inputPathShort = '';
  outputPath: string | string[] = '';
  fileCheckbox: boolean;
  isConverting: boolean = false;
  progressLoading: boolean = false;
  progressionStatus: number = 0;
  convertedFiles: number = 0;
  totalFiles: number = 0;
  // electronService API for ipcMain and ipcRenderer communication, ngZone for immediately reflect data change from ipcMain sender
  constructor(private _electronService: ElectronService, private zone: NgZone, private apollo: Apollo) { }
  ngOnInit() {
    this.videoClasses = videoClasses;
    this.videoTopics = videoTopics;
  }

  categoryChange(value) {
    if (value !== '0') {
      this.selectedTopics = this.videoTopics.filter(obj => obj.pid.includes(value));
      this.selectedClassID = value;
    } else {
      this.selectedTopics = undefined;
    }
  }

  topicChange(value) {
    if (value !== '0') {
      this.selectedTopicID = value;
    } else {
      this.selectedTopicID = undefined;
    }
  }

  createDB(raw) {




    const files = raw.replace(/}[\n,\s]+?{/g, '}splitjson{').split('splitjson');
    files.forEach(item => {
      const file = JSON.parse(item);
      const fileName = file.format.filename.replace(/^(.*[\\\/])/, '');
      const originalPath = file.format.filename.replace(/([^\/]+$)/, '');
      const fileThumb = this.outputPath.concat('/', fileName, '/', 'Thumb_720p/01.jpg');

      // console.log(file.format.filename);
      // console.log(file.format.duration);
      // console.log(file.format.size);
      // console.log(fileName);
      // console.log(originalPath);
      // console.log(fileThumb);


      this.apollo.mutate<CreateContentResult>({
        mutation: CREATE_CONTENT,
        variables: {
          contentName: fileName,
          contentPid: this.selectedTopicID,
          contentDuration: file.format.duration,
          contentSize: file.format.size,
          contentOrigin: originalPath,
          contentFolder: this.outputPath,
          contentThumb: fileThumb,
          contentType: 'video'
        },
      }).subscribe(({ data }) => { console.log(data); }, (error) => {
        console.log('error creating new entries', error);
      });

    });
  }


  OpenDialog() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('open-file-dialog', this.fileCheckbox);
      this._electronService.ipcRenderer.on('directory-path', (event, inpath) => {
        this.zone.run(() => {
          this.inputPath = inpath;
        })
      })
    }
  }

  SaveDialog() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('save-dialog');
      this._electronService.ipcRenderer.on('saved-path', (event, outpath) => {
        this.zone.run(() => {
          this.outputPath = outpath[0];
        })
      })
    }
  }
  test() {
    // var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();
    // console.log(ciphertext);
    // var bytes = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
    // var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(originalText);


    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('test');
    }
  }


  Convert() {
    if (this._electronService.isElectronApp) {
      if (this.inputPath === '' || this.outputPath === '') {
        this._electronService.ipcRenderer.send('error-message', 'missing-path');
      } else {
        this.isConverting = true;
        this._electronService.ipcRenderer.send('start-convert', this.inputPath, this.outputPath, this.fileCheckbox);
        this._electronService.ipcRenderer.on('exec-done', (event) => {
          this.zone.run(() => {
            this.isConverting = false;
            this.progressLoading = false;
            this.progressionStatus = 0;
            // this.inputPathShort = '';
            this.outputPath = '';
            this.inputPath = '';
          });
        });

        this._electronService.ipcRenderer.on('progression', (event, arg1, arg2, arg3) => {
          this.zone.run(() => {
            this.progressionStatus = arg1;
            this.convertedFiles = arg2;
            this.totalFiles = arg3;
            if (this.progressionStatus > 0.99) {
              this.progressLoading = true;
            } else {
              this.progressLoading = false;
            }
          });
        });

        // this._electronService.ipcRenderer.on('create-db', (event, data) => {
        //   this.createDB(data);
        // });
      };
    }
  }

  Cancel() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('stop-convert');
      this.zone.run(() => {
        this.isConverting = false;
        this.inputPath = '';
        this.outputPath = '';
      })
    }
  }

}