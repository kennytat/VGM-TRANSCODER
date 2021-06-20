import { Component, NgZone, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import * as type from '../graphql.types';

type AllDataResponse = {
  media: type.Media;
}
type AllVideoResponse = {
  video: type.Content;
}
type AllAudioResponse = {
  audio: type.Content;
}
type VideoClassResponse = {
  getVideoClasses: type.Classification;
}
type VideoTopicResponse = {
  getVideoTopics: type.Topic;
}
export let videoClasses: any;
export let videoTopics: any;
@Component({
  selector: 'vgm-converter-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})

export class Tab2Page implements OnInit {
  constructor(private _electronService: ElectronService, private zone: NgZone, private apollo: Apollo) { }
  // GQL client subscription for connecting GQL server
  private allDataSubscription: Subscription;
  private allVideoSubscription: Subscription;
  private allAudioSubscription: Subscription;
  private videoClassSubscription: Subscription;
  private videoTopicSubscription: Subscription;
  // Declare variable for videoDB and audioDB seperately
  videoBtnColor = 'primary';
  audioBtnColor = 'light';
  video = true;
  // Declare variable and setting for mapping GQL data to ngx-Tree
  allDB;
  videoDB;
  videoTree: TreeviewItem[];
  videoFiles;
  audioDB;
  audioTree: TreeviewItem[];
  audioFiles;
  displayDB;
  selectedFileInfo = [];
  selectedFileCount;
  config = TreeviewConfig.create({
    hasFilter: true,
    hasCollapseExpand: true,
    hasAllCheckBox: true,
    decoupleChildFromParent: false
  });

  // Declare DB mutation value
  videoClasses;
  videoTopics;
  selectedTopics;
  selectedClassID;
  selectedTopicID;
  selectedFilesID = [];
  // Declare file info variable on selected
  disable = true;
  mainFn = true;
  editFn = false;
  newFn = false;
  dataInfo = false;
  infoBtn = false;
  filename: string;
  filetype: string;
  folder: string;
  publish: string;
  qm: string;
  updatedAt: number;
  duration: number;
  size: number;
  // Declare output filter
  nameFilter = true;
  topicFilter = true;
  publishFilter = true;
  pathFilter = true;
  metaFilter = true;

  showDiv(divVal: string) {
    if (divVal === 'V') {
      this.video = true;
      this.videoBtnColor = 'primary';
      this.audioBtnColor = 'light';
      this.displayDB = this.videoDB;
    } else {
      this.video = false;
      this.videoBtnColor = 'light';
      this.audioBtnColor = 'primary';
      this.displayDB = this.audioDB;
    }
  }
  // Run function OnInit
  ngOnInit() {
    this.connectGQL();
  }

  connectGQL() {
    // Connect to GQL Server and get all Data
    this.allDataSubscription = this.apollo.watchQuery<AllDataResponse>({
      query: type.LIST_ALL_QUERY
    })
      .valueChanges
      .subscribe(({ data }) => {
        this.allDB = data.media;
        if (this.allDB.children[1].text === 'videoDB') {
          this.videoDB = this.allDB.children[1];
          this.audioDB = this.allDB.children[0];
        } else {
          this.videoDB = this.allDB.children[0];
          this.audioDB = this.allDB.children[1];
        }
        this.videoTree = [new TreeviewItem(this.videoDB)];
        this.audioTree = [new TreeviewItem(this.audioDB)];
        this.displayDB = this.videoDB;
      });
    // Get all video files data
    this.allVideoSubscription = this.apollo.watchQuery<AllVideoResponse>({ query: type.VIDEO_QUERY })
      .valueChanges.subscribe(({ data }) => { this.videoFiles = data.video; });
    // Get all audio files data
    this.allAudioSubscription = this.apollo.watchQuery<AllAudioResponse>({ query: type.AUDIO_QUERY })
      .valueChanges.subscribe(({ data }) => { this.audioFiles = data.audio; });
    this.videoClassSubscription = this.apollo.watchQuery<VideoClassResponse>({ query: type.VIDEO_CLASS_QUERY })
      .valueChanges.subscribe(({ data }) => { this.videoClasses = data.getVideoClasses; videoClasses = this.videoClasses });
    this.videoTopicSubscription = this.apollo.watchQuery<VideoTopicResponse>({ query: type.VIDEO_TOPIC_QUERY })
      .valueChanges.subscribe(({ data }) => { this.videoTopics = data.getVideoTopics; videoTopics = this.videoTopics; });
  }

  treeSelectedChange(event) {
    this.selectedFilesID = event;
    this.selectedFileCount = this.selectedFilesID.length;
    if (this.selectedFileCount >= 1) {
      const v = this.videoFiles.filter(data => event.includes(data.id));
      const a = this.audioFiles.filter(data => event.includes(data.id));
      if (v[0] !== undefined) {
        this.selectedFileInfo = v;
      } else {
        this.selectedFileInfo = a;
      }
      this.dataInfo = true;
      this.infoBtn = true;
    } else {
      this.selectedFileInfo = [];
      this.dataInfo = false;
      this.infoBtn = false;
    };
    console.log(event)
  }

  treeFilterChange(event: string) {
    console.log('filter:', event);
  }


  checkFilter(value, check) {
    switch (value) {
      case 'nameFilter':
        this.nameFilter = check;
        break;
      case 'topicFilter':
        this.topicFilter = check;
        break;
      case 'publishFilter':
        this.publishFilter = check;
        break;
      case 'pathFilter':
        this.pathFilter = check;
        break;
      case 'metaFilter':
        this.metaFilter = check;
        break;
      default:
        this.nameFilter = true;
        this.topicFilter = true;
        this.publishFilter = true;
        this.pathFilter = true;
        this.metaFilter = true;
    }
  }

  categoryChange(value) {
    this.selectedTopics = this.videoTopics.filter(obj => obj.pid.includes(value));
    this.selectedClassID = value;

  }

  topicChange(value) {
    this.selectedTopicID = value;
  }


  modifyDBBtn(value) {
    switch (value) {
      case 'edit':
        this.mainFn = false;
        this.editFn = true;
        this.disable = false;
        break;
      case 'new':
        this.mainFn = false;
        this.newFn = true;
        this.disable = false;
        break;
      case 'cancel':
        this.editFn = false;
        this.newFn = false;
        this.mainFn = true;
        this.disable = true;
        break;
      default:
        this.newFn = false;
        this.editFn = false;
        this.mainFn = true;
        this.disable = true;
    }

  }

  newDB(messageID) {
    console.log('function to create new db', messageID);
  }

  updateDB(messageID) {
    console.log('function to update db', messageID);
  }

  deleteDB(messageID) {
    console.log('function to delete db', messageID);
    this.selectedFilesID.forEach(fileID => {
      this.apollo.mutate({
        mutation: type.DELETE_CONTENT,
        variables: { contentId: fileID, },
      }).subscribe(({ data }) => { console.log(data); }, (error) => {
        console.log('error deleting files', error);
      });

    }
    );

    const deletedFilesCount = this.selectedFilesID.length;
    let execDoneMessage = '';
    if (messageID === 1) {
      execDoneMessage = `Total ${deletedFilesCount} data deleted and keeping original files `;
      console.log('exec deleting data and keeping files');
    } else if (messageID === 2) {
      execDoneMessage = `Total ${deletedFilesCount} data and original files have been deleted`;
      console.log('exec deleting data and files');
    }
    this.execDBDone(execDoneMessage);

  }



  execDBConfirmation(method) {
    if (this._electronService.isElectronApp) {
      if (this.selectedFilesID !== []) {
        this._electronService.ipcRenderer.send('exec-db-confirmation', method);
        this._electronService.ipcRenderer.on('exec-confirm-message', (event, resMethod, messageID) => {
          if (messageID !== 0) {
            if (resMethod === 'newDB') {
              this.newDB(messageID);
            }
            else if (resMethod === 'updateDB') { this.updateDB(messageID); }
            else if (resMethod === 'deleteDB') { this.deleteDB(messageID); }
          }
        })
      } else {
        this._electronService.ipcRenderer.send('error-message', 'empty-select');
      }


    }

  }

  // Show corresponding message when mutating db done
  execDBDone(message) {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('exec-db-done', message);
      this.zone.run(() => {
        this.editFn = false;
        this.newFn = false;
        this.mainFn = true;
        this.disable = true;
      });
    }
  }
}
