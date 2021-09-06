import { Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Apollo } from 'apollo-angular';
import * as type from 'libs/xplat/core/src/lib/services/graphql.types';
import { DataService } from '@vgm-converter/xplat/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
interface SelectedTopic {
  level: number,
  id: string,
  name?: string,
  createGQL?: any,
  updateGQL?: any,
  options: any[]
}
@Component({
  selector: 'vgm-converter',
  templateUrl: 'converter.page.html',
  styleUrls: ['converter.page.scss'],
})
export class ConverterPage implements OnInit {
  isVideo: boolean = true;
  level1: SelectedTopic = {
    level: 1, id: '0', options: [
      { name: 'videoDB', id: '00000000-0000-0000-0000-000000000001', location: '/VGMV', url: '' },
      { name: 'audioDB', id: '00000000-0000-0000-0000-000000000002', location: '/VGMA', url: '' }
    ]
  }
  level2: SelectedTopic = { level: 2, id: '0', createGQL: type.CREATE_LEVEL_2, updateGQL: type.UPDATE_LEVEL_2, options: [] }
  level3: SelectedTopic = { level: 3, id: '0', createGQL: type.CREATE_LEVEL_3, updateGQL: type.UPDATE_LEVEL_3, options: [] }
  level4: SelectedTopic = { level: 4, id: '0', createGQL: type.CREATE_LEVEL_4, updateGQL: type.UPDATE_LEVEL_4, options: [] }
  level5: SelectedTopic = { level: 5, id: '0', createGQL: type.CREATE_LEVEL_5, updateGQL: type.UPDATE_LEVEL_5, options: [] }
  level6: SelectedTopic = { level: 6, id: '0', createGQL: type.CREATE_LEVEL_6, updateGQL: type.UPDATE_LEVEL_6, options: [] }
  selectedTopics = [this.level1, this.level2, this.level3, this.level4, this.level5, this.level6]
  selectedItem: any;
  selectedLevel: string = '0';
  // Declare variable for conversion feature
  inputPath: string | string[] = '';
  outputPath: string | string[] = '';
  fileCheckbox: boolean;
  isConverting: boolean = false;
  progressLoading: boolean = false;
  progressionStatus: number = 0;
  convertedFiles: number = 0;
  totalFiles: number = 0;
  // electronService API for ipcMain and ipcRenderer communication, ngZone for immediately reflect data change from ipcMain sender
  path = '';
  level = 0;

  constructor(
    private _electronService: ElectronService,
    private zone: NgZone,
    private apollo: Apollo,
    private dataService: DataService) {

  }


  ngOnInit() {
    //create large db instant code
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.on('create-manual', (event, value) => {
        this.createNewTopic(this.level, value)
      })
    }

  }




  selectOptionChange(level, itemID) {
    this.selectedLevel = level;
    if (itemID === this.level1.options[0].id) {
      this.isVideo = true;
    } else if (itemID === this.level1.options[1].id) {
      this.isVideo = false;
    }
    if (itemID === '0') {
      this.selectedTopics[level - 1].id = '0';
    } else if (itemID === '1') {
      this.selectedTopics[level - 1].id = '1';

    } else {
      this.selectedTopics[level - 1].id = itemID;
      this.selectedTopics[level].id = '0';
      this.selectedTopics[level].options = [];
      const options = this.getOptions(itemID);
      if (options.id) { this.selectedItem = options }
      if (this.selectedItem.children && this.selectedItem.children.length > 0 && this.selectedItem.isLeaf === false) {
        this.selectedTopics[level].options = this.selectedItem.children;
      }
      console.log('selected', this.selectedItem);
    }
  }

  getOptions(id) {
    let selected: any = {};
    let db: any[] = []
    if (this.isVideo) {
      db = this.dataService.videoDB
    } else {
      db = this.dataService.audioDB
    }
    db.filter(function getItem(item) {
      if (item.id === id) {
        selected = item
      }
      if (item.children && item.children.length > 0 && item.isLeaf === false) {
        item.children.filter(getItem)
      }
    });
    return selected
  }


  async createNewTopic(level, value) {
    const pid = this.selectedTopics[level - 2].id;
    const gql = this.selectedTopics[level - 1].createGQL;
    const nonVietnamese = await this.nonAccentVietnamese(value);
    const pList = [...this.selectedTopics[level - 2].options];
    const [pItem] = pList.filter((item) => item.id.includes(pid));
    // console.log('parent', pid, pItem, pList);

    this.selectedTopics[level - 1].name = '';
    await this.apollo.mutate<any>({
      mutation: gql,
      variables: {
        pid: pid,
        isLeaf: false,
        location: `${pItem.location}/${nonVietnamese.replace(/\s/g, '')}`,
        url: pItem.url.concat('.', nonVietnamese.toLowerCase().replace(/[\W\_]/g, '-')).replace(/^\.|\.$/g, ''),
        isVideo: this.isVideo,
        name: value,
      }
    }).subscribe(async ({ data }) => {
      // switch (level) {
      //   case 2:
      //     this.selectedItem = await _.cloneDeep(data.createLevel2)
      //     break;
      //   case 3:
      //     this.selectedItem = await _.cloneDeep(data.createLevel3)
      //     break;
      //   case 4:
      //     this.selectedItem = await _.cloneDeep(data.createLevel4)
      //     break;
      //   case 5:
      //     this.selectedItem = await _.cloneDeep(data.createLevel5)
      //     break;
      //   case 6:
      //     this.selectedItem = await _.cloneDeep(data.createLevel6)
      //     break;
      //   default:
      // }
      // await this.selectedTopics[level - 1].options.push(this.selectedItem)
      // await this.dataService.fetchDB(this.isVideo);
      // // console.log(this.selectedItem);

      // await this.selectOptionChange(level, this.selectedItem.id)

      console.log(data);


    }, (error) => {
      console.log('there was an error sending the query', error);
      // if (this._electronService.isElectronApp) {
      //   this._electronService.ipcRenderer.invoke('error-message', 'topic-db-error');
      // }
    });
  }

  updateIsLeaf(item, count) {
    this.apollo.mutate<any>({
      mutation: this.selectedTopics[item.dblevel - 1].updateGQL,
      variables: {
        id: item.id,
        isLeaf: true,
        count: count
      }
    }).subscribe(({ data }) => {
      console.log(data);
    }, (error) => {
      console.log('error updating isLeaf', error);
    });
  }

  nonAccentVietnamese(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
  }

  test() {
    console.log(this.path, this.level);
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('test', this.path);
    }

    // this.updateIsLeaf();
    // console.log(this.level1.options, '\n', this.level2.options, '\n', this.level3.options, '\n', this.level4.options, '\n', this.level5.options);
    //     const data = `/home/kennytat/Downloads/bigbig/BigBuck.mp4
    // /home/kennytat/Downloads/bigbig/Bigbig-123.mp4`
    //     console.log(data.split("\n"));


    //   console.log(this.level1.options, this.level2.options, this.level3.options, this.level4.options);

    // createDB(raw) {

    // if (this._electronService.isElectronApp) {
    //   this._electronService.ipcRenderer.invoke('test');
    // }
    // this.apollo.mutate<any>({
    //   mutation: type.CREATE_LEVEL_2,
    //   variables: {
    //     pid: "00000000-0000-0000-0000-000000000001",
    //     isLeaf: true,
    //     location: "asdfasdf234",
    //     url: "data.url",
    //     isVideo: false,
    //     name: "data 05 moto",
    //   }
    // }).subscribe(({ data }) => {
    //   console.log('got data', data);
    //   console.log(data.createLevel2.id);
    //   console.log(videoDB);
    // }, (error) => {

    //   console.log('there was an error sending the query', error);
    // });


  }


  //   const files = raw.replace(/}[\n,\s]+?{/g, '}splitjson{').split('splitjson');
  //   files.forEach(item => {
  //     const file = JSON.parse(item);
  //     const fileName = file.format.filename.replace(/^(.*[\\\/])/, '');
  //     const originalPath = file.format.filename.replace(/([^\/]+$)/, '');
  //     const fileThumb = this.outputPath.concat('/', fileName, '/', 'Thumb_720p/01.jpg');

  //     // console.log(file.format.filename);
  //     // console.log(file.format.duration);
  //     // console.log(file.format.size);
  //     // console.log(fileName);
  //     // console.log(originalPath);
  //     // console.log(fileThumb);


  //     this.apollo.mutate<CreateContentResult>({
  //       mutation: CREATE_CONTENT,
  //       variables: {
  //         contentName: fileName,
  //         contentPid: this.selectedTopicID,
  //         contentDuration: file.format.duration,
  //         contentSize: file.format.size,
  //         contentOrigin: originalPath,
  //         contentFolder: this.outputPath,
  //         contentThumb: fileThumb,
  //         contentType: 'video'
  //       },
  //     }).subscribe(({ data }) => { console.log(data); }, (error) => {
  //       console.log('error creating new entries', error);
  //     });

  //   });
  // }



  OpenDialog() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.invoke('open-dialog', this.fileCheckbox).then((inpath) => {
        // console.log(inpath);
        this.zone.run(() => {
          this.inputPath = inpath;
        })
      })
    }
  }

  SaveDialog() {
    if (this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.invoke('save-dialog').then((outpath) => {
        this.zone.run(() => {
          this.outputPath = outpath.toString();
        })
      })
    }
  }


  Convert() {
    if (this._electronService.isElectronApp) {
      if (this.inputPath === '' || this.outputPath === '' || !this.selectedItem) {
        this._electronService.ipcRenderer.invoke('error-message', 'missing-path');
      } else {
        this.isConverting = true;
        this._electronService.ipcRenderer.invoke('start-convert', this.inputPath, this.outputPath, this.fileCheckbox, this.selectedItem);
        this._electronService.ipcRenderer.on('exec-done', (event) => {
          this.zone.run(() => {
            this.updateIsLeaf(this.selectedItem, this.totalFiles);
            this.isConverting = false;
            this.progressLoading = false;
            this.progressionStatus = 0;
            this.outputPath = '';
            this.inputPath = '';
            this.dataService.fetchDB(this.isVideo);
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
      this._electronService.ipcRenderer.invoke('stop-convert').then((response) => {
        this.zone.run(() => {
          this.isConverting = false;
          this.inputPath = '';
          this.outputPath = '';
          this.dataService.fetchDB(this.isVideo);
        })
      })
    }
  }

}