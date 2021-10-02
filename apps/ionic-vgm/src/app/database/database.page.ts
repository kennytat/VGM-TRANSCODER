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
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: 'http://search.hjm.bid',
  apiKey: 'helloworld', // 'helloworld'
})

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
  ];
  updateGQL: any[] = [
    type.UPDATE_LEVEL_2,
    type.UPDATE_LEVEL_3,
    type.UPDATE_LEVEL_4,
    type.UPDATE_LEVEL_5,
    type.UPDATE_LEVEL_6,
    type.UPDATE_LEVEL_7,
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
  _searchInit = false;
  meiliSearch: any;
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
        console.log(this.videoTree);

      }
    });
    this.audioTreeSub = this.dataService.audioTree$.subscribe((data) => {
      if (data.value) {
        this.audioTree = [new TreeviewItem(data)];
        console.log(data, this.audioTree);
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
    try {
      await this.dataService.dbInit();
      this._dbInit = this.dataService._dbInit;
      this.connectSearch();
    } catch (error) {
      console.log(error);
    }
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('create-database', (event, fileInfo) => {
        this.updateIsLeaf(fileInfo);
        this.createNewItem(fileInfo);
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
      console.log('created local DB', data);
      switch (item.dblevel) {
        case 2:
          this.addSearch([data.createLevel2]);
          break;
        case 3:
          this.addSearch([data.createLevel3]);
          break;
        case 4:
          this.addSearch([data.createLevel4]);
          break;
        case 5:
          this.addSearch([data.createLevel5]);
          break;
        case 6:
          this.addSearch([data.createLevel6]);
          break;
        case 7:
          this.addSearch([data.createLevel7]);
          break;
        default:
      }
    }, (error) => {
      console.log('error creating new item', error);
    });
  }

  updateIsLeaf(item) {
    this.apollo.mutate<any>({
      mutation: this.updateGQL[item.dblevel - 3],
      variables: {
        id: item.pid,
        isLeaf: true,
        count: 0
      }
    }).subscribe(({ data }) => {
      console.log(data);
    }, (error) => {
      console.log('error updating isLeaf', error);
    });
  }


  refreshDB() {
    this.dataService.fetchDB(this.isVideo);
    this.connectSearch();
  }

  async connectSearch() {
    try {
      const indexes = await client.listIndexes();
      console.log('meiliSearch', indexes);
      if (indexes) {
        this.meiliSearch = client.index('VGMDB');
        this._searchInit = true;
      }
    } catch (error) {
      console.log(error);
    }
  }



  test() {
    if (this._electronService.isElectronApp) {
      // set prefixed local path to database folder, start vs end converting point for each machine. Ex: '/home/vgmuser/Desktop' 
      const prefixPath = '/home/kennytat/Desktop';
      const startPoint = 6; // audio 6, video Thieu Nhi done
      const endPoint = 500;
      const fileType = 'audio';
      this._electronService.ipcRenderer.send('test', prefixPath, fileType, startPoint, endPoint);
    }
  }

  async downloadDB() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.invoke('save-dialog').then(async (outpath) => {
        if (outpath[0]) {

          const itemList: any[] = await this.getAllIsLeaf(this.isVideo);
          console.log(itemList);
          await itemList.forEach(async item => { await this._electronService.ipcRenderer.invoke('export-database', item, outpath, 'isLeaf') });
          const topicList: any[] = await this.getAllNonLeaf(this.isVideo);
          console.log(topicList);
          await topicList.forEach(async item => { await this._electronService.ipcRenderer.invoke('export-database', item, outpath, 'nonLeaf') });
          const items: any[] = await this.getAllItem(this.isVideo);
          console.log(items);
          await items.forEach(async item => { await this._electronService.ipcRenderer.invoke('export-database', item, outpath, 'isFile') });
          await this._electronService.ipcRenderer.invoke('export-database', items, outpath, 'searchAPI')
        }
      })
    }
  }

  getAllItem(isVideo) {
    let files: any[] = [];
    let db: any[] = [];
    if (isVideo) {
      db = this.dataService.videoDB
    } else {
      db = this.dataService.audioDB
    }
    db.forEach(function getItem(item) {
      if (item.isLeaf === null) {
        files.push(item)
      }
      if (item.children.length >= 1) {
        item.children.forEach(getItem)
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
    db.forEach(function getItem(item) {
      if (item.isLeaf === true) {
        lists.push(item);
      }
      if (item.children.length >= 1) {
        item.children.forEach(getItem)
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

    db.forEach(function getItem(item) {
      if (item.isLeaf === false) {
        lists.push(item);
      }
      if (item.children.length >= 1) {
        item.children.filter(getItem)
      }
    });

    // lists.forEach((item) => {
    //   if (item.children[0]) {
    //     item.children.forEach(elem => {
    //       console.log(elem);

    //       // if (elem.children[0]) {
    //       //   elem.children = []
    //       // }
    //     });
    //   }
    // })
    return lists;
  }

  treeSelectedChange(ids) {
    this.selectedFilesID = ids;
    this.selectedFileCount = this.selectedFilesID.length;
    if (this.selectedFileCount >= 1) {
      const v = this.videoFiles.filter(data => ids.includes(data.id));
      const a = this.audioFiles.filter(data => ids.includes(data.id));
      if (this.isVideo) {
        this.selectedFileInfo = v;
      } else {
        this.selectedFileInfo = a;
      }
    } else {
      this.selectedFileInfo = [];
    };
    console.log(this.selectedFilesID, this.selectedFileInfo)
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
      if (this.selectedFilesID[0]) {
        this._electronService.ipcRenderer.invoke('exec-db-confirmation', method).then((result) => {
          if (result.response !== 0) {
            if (result.method === 'updateDB') { this.updateDB(); }
            else if (result.method === 'deleteDB') { this.deleteDB(); }
          }
        })
      } else {
        this._electronService.ipcRenderer.invoke('error-message', 'empty-select');
      }
    }
  }

  updateDB() {
    console.log('function to update db');
    this.selectedFileInfo.forEach(item => {
      this.apollo.mutate<any>({
        mutation: this.updateGQL[item.dblevel - 2],
        variables: {
          id: item.id,
          isLeaf: item.isLeaf,
          count: item.count,
          location: item.location,
          name: item.name,
          url: item.url,
          keyword: item.keyword,
          hash: item.hash,
          audience: item.audience,
          mtime: item.mtime,
          viewCount: item.viewCount
        },
      }).subscribe(({ data }) => {
        console.log('updated local DB', data);
        switch (item.dblevel) {
          case 2:
            this.addSearch([data.updateLevel2]);
            break;
          case 3:
            this.addSearch([data.updateLevel3]);
            break;
          case 4:
            this.addSearch([data.updateLevel4]);
            break;
          case 5:
            this.addSearch([data.updateLevel5]);
            break;
          case 6:
            this.addSearch([data.updateLevel6]);
            break;
          case 7:
            this.addSearch([data.updateLevel7]);
            break;
          default:
        }
      }, (error) => {
        console.log('error deleting files', error);
      });
    });
  }

  deleteDB() {
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

      this.apollo.mutate<any>({
        mutation: this.deleteGQL[selected.dblevel - 2],
        variables: { id: fileID },
      }).subscribe(({ data }) => {
        console.log('deleted local DB', data);

        // this.deleteSearch(fileID);
      }, (error) => {
        console.log('error deleting files', error);
      });
    });

    this.dataService.fetchDB(this.isVideo);
    const execDoneMessage: string = `Total ${this.selectedFilesID.length} items has been deleted`;
    this.execDBDone(execDoneMessage);
  }

  uploadDB() {
    this.addSearch(this.selectedFileInfo);
    const execDoneMessage: string = `Total ${this.selectedFileInfo.length} items has been updated to blockchain`;
    this.execDBDone(execDoneMessage);
  }


  addSearch(list: any[]) {
    if (this.meiliSearch) {
      this.meiliSearch.addDocuments(list);
    }
  }

  deleteSearch(id: string) {
    if (this.meiliSearch) {
      this.meiliSearch.deleteDocument(id);
    }
  }


  // Show corresponding message when mutating db done
  execDBDone(message) {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.invoke('exec-db-done', message);
      this.zone.run(() => {
        this.editFn = false;
        this.mainFn = true;
      });
    }
  }

}
