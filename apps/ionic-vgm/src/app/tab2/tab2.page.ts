import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import * as type from './db.types';

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
  constructor(private apollo: Apollo) { }
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
  basicFilter = true;
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
    this.selectedFileCount = event.length;
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

  modifyDB(value) {
    if (value === 'edit') {
      this.editFn = true;
      this.disable = false;
    } else {
      this.newFn = true;
    }
    this.mainFn = false;
  }

  updateDB() {
    this.editFn = false;
    this.mainFn = true;
    this.disable = true;
  }

  deleteDB() {
    this.editFn = false;
    this.mainFn = true;
    this.disable = true;
  }
  saveDB() {
    this.newFn = false;
    this.mainFn = true;
    this.disable = true;
  }

  cancelDB() {
    this.mainFn = true;
    this.editFn = false;
    this.newFn = false;
    this.disable = true;
  }

  checkFilter(value, check) {
    switch (value) {
      case 'basicFilter':
        this.basicFilter = check;
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
        this.basicFilter = true;
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
}
