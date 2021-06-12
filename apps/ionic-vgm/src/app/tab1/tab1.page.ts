import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import { Media, Content } from './db.types'

export const LIST_ALL_DATA = gql`
 query {
  media (id: "effbc45f-bed4-4d8a-ac91-c4430139ade2") {
    value:id
    text:name
    children:categories {
          value:id
          text:name
          children:classes {
            value:id
            text:name
            children:topics {
              value:id
              text:name
              children:contents {
                value:id
                text:name
            }
          }
        }
      }
  }
}`;

export const VIDEO_DATA = gql`
  query {
  video {
    id
    pid
    name
    qm
    updatedAt
    createdAt
    thumb
    size
    duration
    filetype
    topic {
      name
      classes {
        name
      }
    }
  }
}`;

export const AUDIO_DATA = gql`
  query {
  audio {
    id
    pid
    name
    qm
    updatedAt
    createdAt
    thumb
    size
    duration
    filetype
    topic {
      name
      classes {
        name
      }
    }
  }
}`;

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
  selector: 'vgm-converter-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})

export class Tab1Page implements OnInit {
  constructor(private apollo: Apollo) { }

  // GQL client subscription for connecting GQL server
  private allDataSubcription: Subscription;
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
  selectedFileInfo;
  treeHeight = window.innerHeight - 400;
  config = TreeviewConfig.create({
    hasFilter: true,
    hasCollapseExpand: true,
    hasAllCheckBox: true,
    decoupleChildFromParent: false,
    maxHeight: this.treeHeight
  });
  // Declare variable for videoDB and audioDB seperately
  videoBtnColor = 'primary';
  audioBtnColor = 'light';
  video = true;
  showDiv(divVal: string) {
    if (divVal === 'V') {
      this.video = true;
      this.videoBtnColor = 'primary';
      this.audioBtnColor = 'light';
    } else {
      this.video = false;
      this.videoBtnColor = 'light';
      this.audioBtnColor = 'primary';
    }
  }

  // Declare file info variable on selected
  filename: string;
  filetype: string;
  folder: string;
  publish: string;
  qm:string;
  updatedAt: number;
  duration: number;
  size: number;


  // Run function OnInit
  ngOnInit() {
    // Connect to GQL Server and get all Data
    this.allDataSubcription = this.apollo.watchQuery<AllDataResponse>({
      query: LIST_ALL_DATA
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
      });
    // Get all video files data
    this.allVideoSubscription = this.apollo.watchQuery<AllVideoResponse>({ query: VIDEO_DATA })
      .valueChanges
      .subscribe(({ data }) => { this.videoFiles = data.video; });
    //Get all audio files data
    this.allAudioSubscription = this.apollo.watchQuery<AllAudioResponse>({ query: AUDIO_DATA })
      .valueChanges
      .subscribe(({ data }) => { this.audioFiles = data.audio; });


  }

  treeSelectedChange(event) {
    // console.log(event);
    if (event.length == 1) {
      let v = this.videoFiles.filter(data => data.id.includes(event[0]));
      let a = this.audioFiles.filter(data => data.id.includes(event[0]));
      if (v[0] !== undefined) {
        this.selectedFileInfo = v[0];
      } else {
        this.selectedFileInfo = a[0]; 
      }
      this.filename = this.selectedFileInfo.name;
      this.filetype = this.selectedFileInfo.filetype;
      this.updatedAt = this.selectedFileInfo.updatedAt;
      this.duration = this.selectedFileInfo.duration;
      this.size = this.selectedFileInfo.size;
      this.folder = ''.concat(this.selectedFileInfo.topic[0].classes[0].name, '/', this.selectedFileInfo.topic[0].name);
      if (this.selectedFileInfo.qm == null) {
        this.qm = "unpublished";
        this.publish = "unpublished"
      } else {
        this.qm = this.selectedFileInfo.qm
        this.publish = "published";
        
      }
      console.log(this.selectedFileInfo)
    } else {
      this.selectedFileInfo = "";
      this.filename = "";
      this.filetype = "";
      this.updatedAt = null;
      this.duration = null;
      this.size = null;
      this.folder = "";
      this.qm = "";
      this.publish = "";
    }



  }

  treeFilterChange(event: string) {
    console.log('filter:', event);
  }

  ngOnDestroy() {
    this.allDataSubcription.unsubscribe();
  }

}