import { Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { videoDB, audioDB } from '../database/database.page';
// import { Content, CREATE_CONTENT } from '../graphql.types';
import { Apollo } from 'apollo-angular';


// type CreateContentResult = {
//   createContent: {
//     content: Content[];
//   };
// }

interface TopicInfo {
  pid: string,
  location: string,
  isVideo: boolean,
  url: string,
  name: string,
  isLeaf: boolean
}
@Component({
  selector: 'vgm-converter',
  templateUrl: 'converter.page.html',
  styleUrls: ['converter.page.scss'],
})
export class ConverterPage implements OnInit {
  currentDB: any[] = [];
  isVideo: boolean;
  // Declare variable for GQL data

  // selectedTopics;
  // selectedClassID;
  selectedItemUrl: string = '01-bai-giang.cac-dien-gia';

  level1ID: string = '0';
  level2ID: string = '0';
  level3ID: string = '0';
  level4ID: string = '0';
  level5ID: string = '0';
  level6ID: string = '0';

  level1Options: any[] = [{ name: 'videoDB', id: '00000000-0000-0000-0000-000000000001' }, { name: 'audioDB', id: '00000000-0000-0000-0000-000000000002' }];
  level2Options: any[] = [];
  level3Options: any[] = [];
  level4Options: any[] = [];
  level5Options: any[] = [];
  level6Options: any[] = [];

  level2Topic: TopicInfo;
  level3Topic: TopicInfo;
  level4Topic: TopicInfo;
  level5Topic: TopicInfo;
  level6Topic: TopicInfo;




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
  constructor(
    private _electronService: ElectronService,
    private zone: NgZone,
    private apollo: Apollo) {

  }
  ngOnInit() {
    // this.audioDB = audioDB
    // console.log(this.videoDB);
    // console.log(this.audioDB);


  }

  selectOptionChange(level, itemID) {
    let options: any;
    if (level === 'level1' && itemID === this.level1Options[0].id) {
      this.currentDB = videoDB;
      this.isVideo = true;
    } else if (level === 'level1' && itemID === this.level1Options[1].id) {
      this.currentDB = audioDB
      this.isVideo = false;
    }
    console.log(level, itemID, this.currentDB);

    switch (level) {
      case 'level1':
        this.level1ID = itemID;
        this.level2Options = getOptions(this.currentDB, itemID);
        break;
      case 'level2':
        this.level2ID = itemID;
        this.level3Options = getOptions(this.currentDB, itemID);
        break;
      case 'level3':
        this.level3ID = itemID;
        this.level4Options = getOptions(this.currentDB, itemID);
        break;
      case 'level4':
        this.level4ID = itemID;
        this.level5Options = getOptions(this.currentDB, itemID);
        break;
      case 'level5':
        this.level5ID = itemID;
        this.level6Options = getOptions(this.currentDB, itemID);
        break;
      case 'level6':
        this.level6ID = itemID;
        break;
      default:
    }

    function getOptions(db, id) {
      console.log(db);
      if (id !== ('0' || '1')) {
        [options] = db.filter(function getItem(item) {
          if (item.children.length > 0) { return item.id === id || item.children.filter(getItem) }
        });
        return options.children
      } else {
        return []
      }
    }
  }

  topicInfo(level, value) {
    switch (level) {
      case 'level2':
        this.level2Topic = this.getTopicInfo(value, this.level1ID, this.level1Options);
        break;
      case 'level3':
        this.level3Topic = this.getTopicInfo(value, this.level2ID, this.level2Options);
        break;
      case 'level4':
        this.level4Topic = this.getTopicInfo(value, this.level3ID, this.level3Options);
        break;
      case 'level5':
        this.level5Topic = this.getTopicInfo(value, this.level4ID, this.level4Options);
        break;
      case 'level6':
        this.level6Topic = this.getTopicInfo(value, this.level5ID, this.level5Options);
        break;
      default:
    }
  }

  getTopicInfo(value, pid, pList) {
    const nonVietnamese = this.nonAccentVietnamese(value);
    const pItem = pList.filter(item => item.id = pid);
    return {
      pid: pid,
      location: `${pItem.location}/${nonVietnamese.replace(/\s/, '')}`,
      isVideo: this.isVideo,
      url: nonVietnamese.toLowerCase().replace(/[\W\_]/g, '-'),
      name: value,
      isLeaf: false
    }
  }

  nonAccentVietnamese(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
  }
  // handleOptionChange(value) {
  //   // this.selectedItemUrl = value;
  //   console.log(value);

  // }

  // createDB(raw) {




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
      this._electronService.ipcRenderer.invoke('open-dialog').then((inpath) => {
        console.log(inpath);
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



  test() {

    // if (this._electronService.isElectronApp) {
    //   this._electronService.ipcRenderer.send('test');
    // }
  }




  Convert() {
    if (this._electronService.isElectronApp) {
      if (this.inputPath === '' || this.outputPath === '' || this.selectedItemUrl) {
        this._electronService.ipcRenderer.send('error-message', 'missing-path');
      } else {
        this.isConverting = true;
        this._electronService.ipcRenderer.send('start-convert', this.inputPath, this.outputPath, this.fileCheckbox, this.selectedItemUrl);
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