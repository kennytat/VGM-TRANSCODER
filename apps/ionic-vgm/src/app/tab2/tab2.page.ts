import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import { Media, Content, LIST_ALL_QUERY, VIDEO_QUERY, AUDIO_QUERY } from './db.types'

type AllDataResponse = {
  media: Media;
}
type AllVideoResponse = {
  video: Content;
}
type AllAudioResponse = {
  audio: Content;
}

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

// Declare file info variable on selected
  disable = true;
  editDBBtn = true;
  dataInfo = false;
  infoBtn = false;
  filename: string;
  filetype: string;
  folder: string;
  publish: string;
  qm:string;
  updatedAt: number;
  duration: number;
  size: number;

  // Declare variable for videoDB and audioDB seperately
  videoBtnColor = 'primary';
  audioBtnColor = 'light';
  video = true;
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
      query: LIST_ALL_QUERY
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
    this.allVideoSubscription = this.apollo.watchQuery<AllVideoResponse>({ query: VIDEO_QUERY })
      .valueChanges
      .subscribe(({ data }) => { this.videoFiles = data.video; });
    // Get all audio files data
    this.allAudioSubscription = this.apollo.watchQuery<AllAudioResponse>({ query: AUDIO_QUERY })
      .valueChanges
      .subscribe(({ data }) => { this.audioFiles = data.audio; });
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
    console.log(this.selectedFileInfo);
    console.log(event)
  }

  treeFilterChange(event: string) {
    console.log('filter:', event);
  }

  editDB() {
    this.disable = false;
    this.editDBBtn = false;
  }

  updateDB() {
    this.disable = true;
    this.editDBBtn = true;
  }

  deleteDB() {
    this.disable = true;
    this.editDBBtn = true;
  }

  ngOnDestroy() {
    this.allDataSubscription.unsubscribe();
    this.allVideoSubscription.unsubscribe();
    this.allAudioSubscription.unsubscribe();
  }

}
