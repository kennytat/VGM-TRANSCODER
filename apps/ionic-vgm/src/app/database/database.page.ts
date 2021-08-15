import { Component, NgZone, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import CryptoJS from "crypto-js";
import { slice } from 'ramda';
import * as type from '../graphql.types';

type Level1Response = {
  level1Unique: type.Level1;
}
type Level2Response = {
  level2res: type.Level2;
}
type Level3Response = {
  level3res: type.Level3;
}
type Level4Response = {
  level4res: type.Level4;
}
type Level5Response = {
  level5res: type.Level5;
}
type Level6Response = {
  level6res: type.Level6;
}
type Level7Response = {
  level7res: type.Level7;
}

export let videoDB: any[] | null = null;
export let audioDB: any[] | null = null;

interface FileInfo {
  location: string,
  filename: string,
  size: number,
  duration: number,
  qm: string,
  url: string,
  hash: string
}
@Component({
  selector: 'vgm-database',
  templateUrl: 'database.page.html',
  styleUrls: ['database.page.scss'],
})

export class DatabasePage implements OnInit {
  constructor(private _electronService: ElectronService, private zone: NgZone, private apollo: Apollo) {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('create-database', (event, fileInfo: FileInfo) => {
        console.log(fileInfo);
        // this.zone.run(() => {
        // });
      })
    }
  }
  // GQL client subscription for connecting GQL server
  private allData: Subscription;
  _dbInit = false;
  // Declare variable for videoDB and audioDB seperately
  isVideo = true;
  // Declare variable and setting for mapping GQL data to ngx-Tree
  // videoDB: any[] | null = null;
  videoTree: TreeviewItem[];
  videoFiles: any[] = [];
  videoItemList: any[] = [];
  videoTopicList: any[] = [];
  // audioDB: any[] | null = null;
  audioTree: TreeviewItem[];
  audioFiles: any[] = [];
  audioItemList: any[] = [];
  audioTopicList: any[] = [];

  selectedFilesID = [];
  selectedFileInfo: any[] = [];
  selectedFileCount;
  // treeview config
  config = TreeviewConfig.create({
    hasFilter: true,
    hasCollapseExpand: true,
    hasAllCheckBox: true,
    decoupleChildFromParent: false
  });

  // Declare output filter && button
  mainFn = true;
  editFn = false;
  nameFilter = true;
  pathFilter = true;
  publishFilter = true;
  metaFilter = true;

  // filename: string;
  // filetype: string;
  // folder: string;
  // publish: string;
  // qm: string;
  // updatedAt: number;
  // duration: number;
  // size: number;


  showDiv(divVal: string) {
    if (divVal === 'V') {
      this.isVideo = true;
    } else {
      this.isVideo = false;
    }
  }
  // Run function OnInit
  async ngOnInit() {
    await this.fetchLevel1(true);
    await this.fetchLevel1(false);
    this._dbInit = true;
  }

  test() {
    this._electronService.ipcRenderer.send('test');
    // this.getAllItem(true);
    // this.getAllItem(false);
    // console.log(this.videoFiles, this.audioFiles);
    console.log(this.videoFiles)
    console.log(this.audioFiles)
  }

  async downloadDB() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.invoke('save-dialog', 'api').then(async (outpath) => {
        const items: any[] = await this.getAllItem(this.isVideo);
        items.forEach(item => { this._electronService.ipcRenderer.send('export-database', item, outpath, 'isFile') });
        const itemList: any[] = await this.getAllIsLeaf(this.isVideo);
        itemList.forEach(item => { this._electronService.ipcRenderer.send('export-database', item, outpath, 'isLeaf') });
        const topicList: any[] = await this.getAllNonLeaf(this.isVideo);
        topicList.forEach(item => { this._electronService.ipcRenderer.send('export-database', item, outpath, 'nonLeaf') });
        console.log(outpath, topicList);
      })
    }
  }

  async fetchLevel1(isVideo) {
    let id: string;
    if (isVideo) {
      id = '00000000-0000-0000-0000-000000000001';
    } else {
      id = '00000000-0000-0000-0000-000000000002';
    }
    this.allData = await this.apollo.watchQuery<Level1Response>({
      query: type.ALL_DATA,
      variables: {
        id: id
      }
    }).valueChanges.subscribe(({ data }) => {
      if (isVideo) {
        videoDB = [data.level1Unique];
        this.videoFiles = this.getAllItem(true);
      } else {
        audioDB = [data.level1Unique];
        this.audioFiles = this.getAllItem(false);
      }
    })

    await this.apollo.watchQuery<Level1Response>({
      query: type.LEVEL_1_TREE,
      variables: {
        id: id
      }
    }).valueChanges.subscribe(({ data }) => {
      const db: any = data.level1Unique;
      if (isVideo) {
        this.videoTree = [new TreeviewItem(db)];
      } else {
        this.audioTree = [new TreeviewItem(db)];
      }
    });
  }

  getAllItem(isVideo) {
    let files: any[] = [];
    let db: any[] = [];
    if (isVideo) {
      db = videoDB
    } else {
      db = audioDB
    }
    db.filter(function getItem(item) {
      if (item.isLeaf === null) {
        files.push(item)
      }
      if (item.children.length >= 1) {
        item.children.filter(getItem)
      }
    });
    return files;
  }

  getAllIsLeaf(isVideo) {
    let lists: any[] = [];
    let db: any[];
    if (isVideo) {
      db = videoDB
    } else {
      db = audioDB
    }
    db.filter(function getItem(item) {
      if (item.isLeaf === true) {
        lists.push(item);
      }
      if (item.children.length >= 1) {
        item.children.filter(getItem)
      }
    });
    return lists;
  }

  getAllNonLeaf(isVideo) {
    let lists: any[] = [];
    let db: any[];
    if (isVideo) {
      db = videoDB
    } else {
      db = audioDB
    }
    db.filter(function getItem(item) {
      if (item.isLeaf === false) {
        const children: any[] = [];
        item.children.forEach(element => {
          let obj = {}
          Object.assign(obj, element);
          Object.defineProperty(obj, 'children', {
            writable: true,
            value: []
          });
          children.push(obj);
        });
        const topic = {}
        Object.assign(topic, item);
        Object.defineProperty(topic, 'children', {
          writable: true,
          value: children
        });
        lists.push(topic);
      }
      if (item.children.length >= 1) {
        item.children.filter(getItem)
      }
    });
    return lists;
  }

  treeSelectedChange(event) {
    this.selectedFilesID = event;
    this.selectedFileCount = this.selectedFilesID.length;
    if (this.selectedFileCount >= 1) {
      const v = this.videoFiles.filter(data => event.includes(data.id));
      const a = this.audioFiles.filter(data => event.includes(data.id));
      if (this.isVideo) {
        this.selectedFileInfo = v;
      } else {
        this.selectedFileInfo = a;
      }
    } else {
      this.selectedFileInfo = [];
    };
    console.log(this.selectedFileInfo)
  }

  treeFilterChange(event: string) {
    console.log('filter:', event);
  }

  checkFilter(value, check) {
    switch (value) {
      case 'nameFilter':
        this.nameFilter = check;
        break;
      case 'pathFilter':
        this.pathFilter = check;
        break;
      case 'publishFilter':
        this.publishFilter = check;
        break;
      case 'metaFilter':
        this.metaFilter = check;
        break;
      default:
        this.nameFilter = true;
        this.pathFilter = true;
        this.publishFilter = true;
        this.metaFilter = true;
    }
  }

  getThumbnail(hash, url) {
    const secretKey = slice(0, 32, `${url}gggggggggggggggggggggggggggggggg`);
    const decrypt = CryptoJS.AES.decrypt(hash, secretKey);
    const qm = decrypt.toString(CryptoJS.enc.Utf8);
    return `https://vn.gateway.vgm.tv/ipfs/${qm}/480/1.png` || ''
  }

  // categoryChange(value) {
  //   this.selectedTopics = this.videoTopics.filter(obj => obj.pid.includes(value));
  //   this.selectedClassID = value;

  // }

  // topicChange(value) {
  //   this.selectedTopicID = value;
  // }


  modifyDBBtn(value) {
    switch (value) {
      case 'edit':
        this.mainFn = false;
        this.editFn = true;
        break;
      case 'cancel':
        this.editFn = false;
        this.mainFn = true;
        break;
      default:
        this.editFn = false;
        this.mainFn = true;
    }

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
            if (resMethod === 'updateDB') { this.updateDB(messageID); }
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
        this.mainFn = true;
      });
    }
  }

}
