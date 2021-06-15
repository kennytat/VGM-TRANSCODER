import { Component, NgZone, OnInit } from '@angular/core';
import { VIDEO_CLASS_QUERY, VIDEO_TOPIC_QUERY, Classification, Topic } from '../db.types';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { ElectronService } from 'ngx-electron';


type VideoClassResponse = {
  getVideoClasses: Classification;
}
type VideoTopicResponse = {
  getVideoTopics: Topic;
}
@Component({
  selector: 'vgm-converter-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  // Declare variable for GQL data
  videoClasses;
  videoTopics;
  selectedTopics;
  classificationID;
  topicID;
  // Declare variable for conversion feature
  inputPath = '';
  inputPathShort = '';
  outputPath = '';
  fileCheckbox: boolean;
  convertButton = true;
  progressLoading = false;
  btnDisable = false;
  progressionStatus = 0;
  convertedFiles = 0;
  totalFiles = 0;
  // electronService API for ipcMain and ipcRenderer communication, ngZone for immediately reflect data change from ipcMain sender
  constructor(private _electronService: ElectronService, private zone: NgZone, private apollo: Apollo) { }
  private videoClassSubscription: Subscription;
  private videoTopicSubscription: Subscription;
  ngOnInit() {
    this.connectGQL();
  }

  connectGQL() {
    // Connect to GQL Server and get all Data
    this.videoClassSubscription = this.apollo.watchQuery<VideoClassResponse>({
      query: VIDEO_CLASS_QUERY
    }).valueChanges.subscribe(({ data }) => { this.videoClasses = data.getVideoClasses; });
    this.videoTopicSubscription = this.apollo.watchQuery<VideoTopicResponse>({
      query: VIDEO_TOPIC_QUERY
    }).valueChanges.subscribe(({ data }) => { this.videoTopics = data.getVideoTopics; });
  }

  categoryChange(value) {
    if (value !== '0') {
      this.selectedTopics = this.videoTopics.filter(obj => obj.pid.includes(value));
      this.classificationID = value;
    } else {
      this.selectedTopics = undefined;
    }
  }

  topicChange(value) {
    if (value !== '0') {
      this.topicID = value;
    }
  }

  test() {
    console.log(this.videoClasses.getVideoClasses);
    console.log(this.videoClasses);
  }

  CheckBoxChange() {
    this.inputPathShort = '';
    this.inputPath = '';
  }
  OpenDialog() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('open-file-dialog', this.fileCheckbox);
      this._electronService.ipcRenderer.on('directory-path', (event, inpath) => {
        this.zone.run(() => {
          this.inputPath = inpath;
          const i = inpath.length;
          if (i > 1) {
            this.inputPathShort = inpath[0] + ' and ' + (i - 1) + ' more files';

          } else {
            this.inputPathShort = inpath[0]
          }
        });
      })
    }
  }

  SaveDialog() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('save-dialog');
      this._electronService.ipcRenderer.on('saved-path', (event, outpath) => {
        this.zone.run(() => {
          this.outputPath = outpath[0];
        });
      })
    }
  }


  Convert() {
    if (this._electronService.isElectronApp) {
      if (this.inputPathShort === '' || this.outputPath === '') {
        this._electronService.ipcRenderer.send('missing-path');
      } else {
        this._electronService.ipcRenderer.send('start-convert', this.inputPath, this.outputPath, this.fileCheckbox);
        this._electronService.ipcRenderer.on('exec-done', (event) => {
          this.zone.run(() => {
            this.convertButton = true;
            this.btnDisable = false;
            this.progressLoading = false;
            this.progressionStatus = 0;
            this.inputPathShort = '';
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
        this.convertButton = false;
        this.btnDisable = true;
      };
    }
  }

  Cancel() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('stop-convert');
      this.convertButton = true;
      this.btnDisable = false;
      this.zone.run(() => {
        this.inputPath = '';
        this.outputPath = '';
      })
    }
  }

  ngOnDestroy() {
    this.videoClassSubscription.unsubscribe();
    this.videoTopicSubscription.unsubscribe();
  }
}