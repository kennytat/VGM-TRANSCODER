import { Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Apollo } from 'apollo-angular';
import * as type from 'libs/xplat/core/src/lib/services/graphql.types';
import { DataService } from '@vgm-converter/xplat/core';
import * as path from 'path'
import * as _ from 'lodash';
import CryptoJS from "crypto-js";
import { slice } from 'ramda';

import Pqueue from 'p-queue';
const queue = new Pqueue();




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
	fileCheckbox: boolean;
	isConverting: boolean = false;
	progressLoading: boolean = false;
	progressionStatus: number = 0;
	convertedFiles: number = 0;
	totalFiles: number = 0;
	// instance for adding db manually
	updateID: string = '';
	updateURL: string = '';
	updateLevel: number = 0;
	newDBArray = [];

	constructor(
		private _electronService: ElectronService,
		private zone: NgZone,
		private apollo: Apollo,
		private _dataService: DataService) {

		if (this._electronService.isElectronApp) {
			// reset state when exec done
			this._electronService.ipcRenderer.on('exec-done', (event) => {
				this.execDone();
			});
			// update state while converting
			this._electronService.ipcRenderer.on('progression', (event, progression) => {
				this.zone.run(() => {
					this.progressionStatus = progression;
					this.progressLoading = this.progressionStatus > 0.99 ? true : false;
				});
			});
		}
	}


	ngOnInit() { }

	async selectOptionChange(level, itemID) {
		this.selectedLevel = level;
		if (itemID === this.level1.options[0].id) {
			this.isVideo = true;
		} else if (itemID === this.level1.options[1].id) {
			this.isVideo = false;
		}
		console.log(level, itemID);

		if (itemID === '0') {
			this.selectedTopics[level - 1].id = '0';
		} else if (itemID === '1') {
			this.selectedTopics[level - 1].id = '1';
		} else {

			this.selectedTopics[level - 1].id = itemID;
			if (level !== this.selectedTopics.length) {
				this.selectedTopics[level].id = '0';
				this.selectedTopics[level].options = [];
			}
			const options: any = await this.getOptions(level, this.isVideo, undefined, itemID);
			if (typeof options[0] != 'undefined') {
				this.selectedItem = _.cloneDeep(options[0]);
			} else {
				this.selectedItem = _.cloneDeep(options);
			};
			if (this.selectedItem.children && this.selectedItem.children.length > 0 && this.selectedItem.isLeaf === false) {
				this.selectedTopics[level].options = this.selectedItem.children;
			}
			console.log('selected', this.selectedItem);
		}

	}


	async getOptions(level: number, isVideo = undefined, isLeaf = undefined, id = undefined, url = undefined) {
		return new Promise(async (resolve) => {
			const result = await this._dataService.fetchLevelDB(level, isVideo, isLeaf, id, url);
			console.log('getoption', result);
			resolve(result);
		});
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
				url: pItem.url.concat('.', nonVietnamese.toLowerCase().replace(/[\W\_]/g, '-')).replace(/^\.|\.$/g, '').replace(/-+-/g, "-"),
				isVideo: this.isVideo,
				name: value,
			}
		}).subscribe(async ({ data }) => {
			const result = data[Object.keys(data)[0]];
			// update parent count
			const [pItem] = _.cloneDeep(await this._dataService.fetchLevelDB(result.dblevel - 1, result.isVideo, undefined, result.pid));
			console.log('pItem after create new:', pItem);
			const pItemCount = pItem.children.length - 1;
			const updateParentOption = {
				id: result.pid,
				count: pItemCount,
			};
			await this._dataService.updateSingle(pItem.dblevel, updateParentOption);
			// update UI view
			this.selectedItem = await _.cloneDeep(result);
			await this.selectedTopics[level - 1].options.push(this.selectedItem);
			await this.selectOptionChange(level, this.selectedItem.id);
			console.log(this.selectedItem);
		}, (error) => {
			console.log('there was an error sending the query', error);
			if (this._electronService.isElectronApp) {
				this._electronService.ipcRenderer.invoke('popup-message', 'topic-db-error');
			}
		});
	}

	async createDirDB(itemName, pItem) {
		return new Promise<string>(async (resolve, reject) => {
			console.log('createmass called:', itemName, pItem);
			const gql = this.selectedTopics[pItem.dblevel + 1 - 1].createGQL;
			const nonVietnamese = await this.nonAccentVietnamese(itemName);
			const url = pItem.url.concat('.', nonVietnamese.toLowerCase().replace(/[\W\_]/g, '-')).replace(/^\.|\.$/g, '').replace(/-+-/g, "-");
			await this.apollo.mutate<any>({
				mutation: gql,
				variables: {
					pid: pItem.id,
					isLeaf: false,
					url: url,
					isVideo: pItem.isVideo,
					name: itemName,
				}
			}).subscribe(async ({ data }) => {
				console.log('created local DB', data);
				const result = await _.cloneDeep(data[Object.keys(data)[0]]);
				const [pItem] = _.cloneDeep(await this._dataService.fetchLevelDB(result.dblevel - 1, result.isVideo, undefined, result.pid));
				console.log('pItem after create new:', pItem);
				const pItemCount = pItem.children.length + 1;
				const updateParentOption = {
					id: result.pid,
					count: pItemCount,
				};
				await this._dataService.updateSingle(pItem.dblevel, updateParentOption);
				resolve(result);
			}, async (error) => {
				// query if existing
				console.log('there was an error sending the query', error, 'try querying existing topic');
				const [result]: any = await this.getOptions(pItem.dblevel + 1, pItem.isVideo, undefined, undefined, url);
				if (result) resolve(result);
			});
		})
	}


	async processDirDB(listArray) {
		return new Promise(async (resolve, reject) => {

			// create large db instant code start
			this.newDBArray = [];
			if (this.selectedItem.name === 'Audio' || this.selectedItem.name === 'Video') {
				this.selectedItem.url = '';
			}
			this.newDBArray.push(this.selectedItem);
			console.log(listArray, this.newDBArray);

			queue.concurrency = 1;
			await listArray.forEach(async dir => {
				(async () => {
					await queue.add(async () => {
						if (!dir.pName) {
							dir.pName = this.selectedItem.name;
							dir.pid = this.selectedItem.id;
						}
						const pIndex = this.newDBArray.findIndex(item => path.basename(dir.pName) === item.name);
						if (pIndex >= 0) {
							console.log('found pItem', this.newDBArray[pIndex], dir.pName);
							const newItem = await this.createDirDB(dir.name, this.newDBArray[pIndex]);
							this.newDBArray.push(newItem)
						} else {
							console.log('pItem not found', dir);
						}
					});
				})();
			});
			await queue.onEmpty().then(async () => {
				console.log('Queue is empty, create directory DB done');
				resolve('done');
			});
		})
	}


	nonAccentVietnamese(str) {
		str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
		str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
		str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
		str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
		str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
		str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
		str = str.replace(/đ/g, "d");

		str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
		str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
		str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
		str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
		str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
		str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
		str = str.replace(/Đ|Ð/g, "D");
		// Some system encode vietnamese combining accent as individual utf-8 characters
		str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
		str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
		return str;
	}

	async test() {
		console.log(this.inputPath);

		// // instance update
		// const qmHash = 'QmQDuZsCmxQm2WwB5WHjG5n92kjuukaKrN7Py59hHC3FJs'
		// const secretKey = slice(0, 32, `01-bai-giang.hoc-theo-sach-trong-kinh-thanh.tim-hieu-thanh-kinh.thtk01-sang-the-ky.sa01-tim-hieu-khai-quatgggggggggggggggggggggggggggggggg`);
		// const folderHash = CryptoJS.AES.encrypt(qmHash, secretKey).toString();
		// const keyHash = CryptoJS.AES.encrypt('QmSNageBUDv9gAEt1Y9NukENbQKMhRcsZQC2svWYib2m6T', secretKey).toString();
		// const updateOption = {
		//   id: this.updateID,
		//   url: this.updateURL,
		//   // qm: qmHash,
		//   // hash: folderHash,
		//   // khash: keyHash,
		// };
		// console.log(updateOption);

		// await this._dataService.updateSingle(this.updateLevel, updateOption);
		// this._electronService.ipcRenderer.send('instance-db', this.updateURL);


		// const item = await this._dataService.fetchLevelDB(1, true, false);
		// console.log('got itemmmmmm', item);

		// const testItem = await this.getOptions(1, true, '00000000-0000-0000-0000-000000000001'); // 00000000-0000-0000-0000-000000000001 3c99cef1-0b91-4cff-a01b-2aa3cc0ca1d4
		// console.log(testItem);


		// console.log(this.path, this.level);
		// if (this._electronService.isElectronApp) {
		//   this._electronService.ipcRenderer.send('test', this.path, this.level);
		// }

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
	}



	openDialog() {
		if (this._electronService.isElectronApp) {
			this._electronService.ipcRenderer.invoke('open-dialog', this.fileCheckbox, this.isVideo).then((inpath) => {
				this.zone.run(() => {
					this.inputPath = inpath;
				})
			})
		}
	}


	async convert() {
		if (this._electronService.isElectronApp) {
			if (!this.inputPath || !this.selectedItem) {
				this._electronService.ipcRenderer.invoke('popup-message', 'missing-path');
			} else {
				this.isConverting = true;
				// create directory DB first
				const dirList = await this._electronService.ipcRenderer.invoke('find-dir-db', this.inputPath);
				await this.processDirDB(dirList);
				// find all files
				const fileList = this.fileCheckbox ? this.inputPath : await this._electronService.ipcRenderer.invoke('find-file-db', this.inputPath, this.isVideo);
				console.log('file list:', fileList);
				this.totalFiles = fileList.length;
				queue.concurrency = this.selectedItem.isVideo ? 1 : 20;
				if (fileList.length > 0) {
					try {
						let tasks = [];
						fileList.forEach(file => {
							tasks.push(async () => {
								const pName = path.basename(path.dirname(file));
								const index = this.newDBArray.findIndex((pItem) => pItem.name === pName);
								const pItem = dirList.length !== 0 ? index >= 0 ? this.newDBArray[index] : undefined : this.selectedItem;
								if (pItem) {
									// start converting files
									await this._electronService.ipcRenderer.invoke('start-convert', file, pItem);
									console.log('start converting files', file, pItem);
									this.convertedFiles++;
								}
							})
						});
						await Promise.all(tasks.map(task => queue.add(task))).then(async () => {
							console.log('exec file done');
							this.execDone();
							this._electronService.ipcRenderer.invoke('popup-message', 'exec-done');
						});

					} catch (error) {

					}



				} else {
					console.log('no file found');
					this._electronService.ipcRenderer.invoke('popup-message', 'no-file-found');
				}


			};
		}
	}

	async execDone() {
		if (this._electronService.isElectronApp) {
			this.zone.run(() => {
				this.isConverting = false;
				this.inputPath = '';
				this.convertedFiles = 0;
				this.totalFiles = 0;
				this.progressLoading = false;
				this.progressionStatus = 0;
				this._dataService.treeRefresh(this.isVideo);
			})
		}
	}


	async cancel() {
		if (this._electronService.isElectronApp) {
			queue.clear();
			this._electronService.ipcRenderer.invoke('stop-convert').then((response) => {
				this.execDone();
			})
		}
	}

}