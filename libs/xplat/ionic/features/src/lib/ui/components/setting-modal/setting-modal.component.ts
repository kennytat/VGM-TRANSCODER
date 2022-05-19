import { Component, Input, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
const { Share } = Plugins;
import { ToastController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LocalforageService } from '@vgm-converter/xplat/core';
import { ElectronService } from 'ngx-electron';

@Component({
	selector: 'vgm-setting-modal',
	templateUrl: 'setting-modal.component.html'
})

export class SettingModalComponent implements OnInit {
	@Input() rcloneConf = [];
	selectedTab: string;
	checkingConf = false;

	constructor(
		public modalController: ModalController,
		public toastController: ToastController,
		private _translateService: TranslateService,
		private _electronService: ElectronService,
		private _localForage: LocalforageService
	) { }

	async ngOnInit() {
		this.selectedTab = this.rcloneConf[0].name;

		for (let i = 0; i < this.rcloneConf.length; i++) {
			const result = await this._localForage.get(this.rcloneConf[i].name);
			if (result) {
				this.rcloneConf[i] = result;
				console.log('config found', this.rcloneConf[i]);
			} else {
				console.log('no conf found, create new');
				await this._localForage.set(this.rcloneConf[i].name, this.rcloneConf[i]);
			}
		}
	}

	segmentChanged(e) {
		this.selectedTab = e.detail.value;
	}

	async saveConf(name) {
		this.checkingConf = true;
		console.log('checking conf:', name)
		const i = this.rcloneConf.findIndex(conf => conf.name === name)
		console.log(name, 'config saved:', this.rcloneConf[i]);
		await this._localForage.set(this.rcloneConf[i].name, this.rcloneConf[i]);
		const connectionResult = await this.checkConfigConnection(this.rcloneConf[i]);
		if (connectionResult) {
			this.presentToast(this._translateService.instant('setting.s3.message-success'), 'toast-success');
		} else {
			this.presentToast(this._translateService.instant('setting.s3.message-error'), 'toast-error')
		}
	}

	async checkConfigConnection(config) {
		return new Promise((resolve) => {
			if (this._electronService.isElectronApp) {
				this._electronService.ipcRenderer.invoke('check-conf', config).then((conf) => {
					console.log(`connection of ${config.name}:`, conf);
					this.checkingConf = false;
					resolve(conf)
				})
			}
		})
	}

	async presentToast(message, cssClass) {
		const toast = await this.toastController.create({
			message: message,
			position: 'top',
			duration: 2000,
			cssClass: cssClass
		});
		toast.present();
	}

	dismiss() {
		this.modalController.dismiss({
			'dismissed': true
		});
	}
}
