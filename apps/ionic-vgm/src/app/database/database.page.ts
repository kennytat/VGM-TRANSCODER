import { Component, Injectable, NgZone, OnInit, SimpleChanges } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import CryptoJS from "crypto-js";
import { slice } from 'ramda';
import * as type from 'libs/xplat/core/src/lib/services/graphql.types';
import { DataService } from '@vgm-converter/xplat/core';
import * as _ from 'lodash';
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
@Component({
  selector: 'vgm-database',
  templateUrl: 'database.page.html',
  styleUrls: ['database.page.scss'],
})
@Injectable({
  providedIn: 'root',
})
export class DatabasePage implements OnInit {
  createGQL: any[] = [
    type.CREATE_LEVEL_2,
    type.CREATE_LEVEL_3,
    type.CREATE_LEVEL_4,
    type.CREATE_LEVEL_5,
    type.CREATE_LEVEL_6,
    type.CREATE_LEVEL_7,
  ]
  deleteGQL: any[] = [
    type.DELETE_LEVEL_2,
    type.DELETE_LEVEL_3,
    type.DELETE_LEVEL_4,
    type.DELETE_LEVEL_5,
    type.DELETE_LEVEL_6,
    type.DELETE_LEVEL_7,
  ]
  private videoDBSub: Subscription
  private audioDBSub: Subscription
  private videoTreeSub: Subscription
  private audioTreeSub: Subscription
  _dbInit = false;
  // Declare variable for videoDB and audioDB seperately
  isVideo = true;
  // Declare variable and setting for mapping GQL data to ngx-Tree
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
  selectedFileCount: number = 0;
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

  constructor(
    private _electronService: ElectronService,
    private zone: NgZone,
    private apollo: Apollo,
    private dataService: DataService) {

    this.videoDBSub = this.dataService.videoDB$.subscribe((data) => {
      if (data[0]) {
        this.videoFiles = this.getAllItem(true);
      }
    });

    this.audioDBSub = this.dataService.audioDB$.subscribe((data) => {
      if (data[0]) {
        this.audioFiles = this.getAllItem(false);
      }
    });
    this.videoTreeSub = this.dataService.videoTree$.subscribe((data) => {
      if (data.value) {
        this.videoTree = [new TreeviewItem(data)];
      }
    });
    this.audioTreeSub = this.dataService.videoTree$.subscribe((data) => {
      if (data.value) {
        this.audioTree = [new TreeviewItem(data)];
      }
    });

  }

  showDiv(divVal: string) {
    if (divVal === 'V') {
      this.isVideo = true;
    } else {
      this.isVideo = false;
    }
  }
  // Run function OnInit
  async ngOnInit() {
    await this.dataService.dbInit();
    this._dbInit = this.dataService._dbInit;
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('create-database', (event, fileInfo) => {
        this.createNewItem(fileInfo)
      })
    }
  }

  ngOnDestroy(): void {
    (this.videoDBSub, this.audioDBSub, this.videoTreeSub, this.audioTreeSub as Subscription).unsubscribe();
  }


  async createNewItem(item) {
    await this.apollo.mutate<any>({
      mutation: this.createGQL[item.dblevel - 2],
      variables: {
        pid: item.pid,
        location: item.location,
        url: item.url,
        isVideo: item.isVideo,
        name: item.name,
        qm: item.qm,
        hash: item.hash,
        duration: item.duration,
        size: item.size
      }
    }).subscribe(async ({ data }) => {
      console.log(data);
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  refreshDB() {
    this.dataService.fetchDB(this.isVideo)
  }

  async test() {
    this.videoTree = await [new TreeviewItem(this.dataService.videoTree)];
    this.audioTree = await [new TreeviewItem(this.dataService.audioTree)];
    // const item = {
    //   pid: '00000000-0000-0000-0000-000000000001',
    //   location: '/VGMV/01_BaiGiang/CacDienGia/BigBuck54',
    //   name: 'BigBuck544564234ghbhm5',
    //   size: 13,
    //   duration: '9:56',
    //   qm: 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX',
    //   url: '01-bai-giang.cac-dien-gia.bigbuck54456',
    //   hash: 'U2FsdGVkX18u7ANXFPc8AbRimF0zGNAEyHB8qHaEOcSEA9mhcEyPrnW35SE/miWgTPghsPoAzxHyxEpyP9oMMA==',
    //   isVideo: true,
    //   dblevel: 2
    // }
    // console.log(item.url);

    // await this.apollo.mutate<any>({
    //   mutation: type.CREATE_LEVEL_2,
    //   variables: {
    //     pid: item.pid,
    //     location: item.location,
    //     url: item.url,
    //     isVideo: item.isVideo,
    //     name: item.name,
    //     qm: item.qm,
    //     hash: item.hash,
    //     duration: item.duration,
    //     size: item.size
    //   }
    // }).subscribe(async ({ data }) => {
    //   console.log(data);
    // }, (error) => {
    //   console.log('there was an error sending the query', error);
    // });



    // this.allData = this.apollo.watchQuery<any>({
    //   query: type.ALL_DATA,
    //   variables: {
    //     id: '00000000-0000-0000-0000-000000000001'
    //   }
    // }).valueChanges.subscribe(({ data }) => {

    //   let test = [_.cloneDeep(data.level1Unique)]
    //   test.push(2)
    //   // this.dataService.videoDB$.next([...data.level1Unique]);
    //   // this.dataService.videoDB$.next([...data.level1Unique]);
    //   // this.videoFiles = this.getAllItem(true);
    //   console.log(test);

    // })

    // this._electronService.ipcRenderer.send('test');

    // this.getAllItem(true);
    // this.getAllItem(false);
    // console.log(this.videoFiles, this.audioFiles);
    // this.dataService..push('asdfasdf')
    // console.log(this.dataService.videoDB)
    // console.log(this.audioFiles, this.audioDB)
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
    await this.apollo.watchQuery<any>({
      query: type.ALL_DATA,
      variables: {
        id: id
      }
    }).valueChanges.subscribe(({ data }) => {
      if (isVideo) {
        this.dataService.videoDB$.next([_.cloneDeep(data.level1Unique)]);
        this.videoFiles = this.getAllItem(true);
      } else {
        this.dataService.audioDB$.next([_.cloneDeep(data.level1Unique)]);
        this.audioFiles = this.getAllItem(false);
      }
    })

    await this.apollo.watchQuery<any>({
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
      db = this.dataService.videoDB
    } else {
      db = this.dataService.audioDB
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
      db = this.dataService.videoDB
    } else {
      db = this.dataService.audioDB
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
      db = this.dataService.videoDB
    } else {
      db = this.dataService.audioDB
    }
    db.filter(function getItem(item) {
      if (item.isLeaf === false) {
        item.children.forEach(children => {
          children.children = []
        });

        lists.push(item);
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
    console.log(this.selectedFilesID)
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

  execDBConfirmation(method) {
    if (this._electronService.isElectronApp) {
      if (this.selectedFilesID !== []) {
        this._electronService.ipcRenderer.invoke('exec-db-confirmation', method).then(async (result) => {
          if (result.response !== 0) {
            if (result.method === 'updateDB') { this.updateDB(); }
            else if (result.method === 'deleteDB') { this.deleteDB(); }
          }
        })
      } else {
        this._electronService.ipcRenderer.send('error-message', 'empty-select');
      }
    }
  }

  updateDB() {
    console.log('function to update db');
  }

  deleteDB() {
    console.log('function to delete db');
    let db: any[] = []
    let selected: any = {};
    if (this.isVideo) {
      db = this.dataService.videoDB
    } else {
      db = this.dataService.audioDB
    }
    this.selectedFilesID.forEach(fileID => {
      db.filter(function getItem(item) {
        if (item.id === fileID) {
          selected = item
        }
        if (item.children && item.children.length >= 1) {
          item.children.filter(getItem)
        }
      });

      this.apollo.mutate({
        mutation: this.deleteGQL[selected.dblevel - 2],
        variables: { id: fileID, },
      }).subscribe(({ data }) => { console.log('deleted', data); }, (error) => {
        console.log('error deleting files', error);
      });
    });
    this.dataService.fetchDB(this.isVideo);
    const deletedFilesCount = this.selectedFilesID.length;
    let execDoneMessage: string = `Total ${deletedFilesCount} items has been deleted`;
    this.execDBDone(execDoneMessage);
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
