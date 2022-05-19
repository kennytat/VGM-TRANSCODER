import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SettingModalComponent } from '@vgm-converter/xplat/ionic/features';
import { LocalforageService, S3Conf } from '@vgm-converter/xplat/core';
import * as pAny from 'p-any';
@Component({
	selector: 'vgm-converter-tabs',
	templateUrl: 'tabs.page.html',
	styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit {
	warehouseConf: S3Conf = {
		name: 'warehouse-vgm-local',
		type: '',
		provider: '',
		access_key_id: '',
		secret_access_key: '',
		endpoint: '',
		acl: '',
		bucket: ''
	};
	encryptedConf: S3Conf = {
		name: 'encrypted-vgm-local',
		type: '',
		provider: '',
		access_key_id: '',
		secret_access_key: '',
		endpoint: '',
		acl: '',
		bucket: ''
	};
	ipfsAPIGateway = { name: 'ipfs-vgm-local', endpoint: '' };
	configs = [this.warehouseConf, this.encryptedConf, this.ipfsAPIGateway]
	constructor(
		public modalController: ModalController,
		private _localForage: LocalforageService
	) { }

	async ngOnInit() {
		let promises = [];
		this.configs.forEach(async config => {
			promises.push(this._localForage.get(config.name).then((result) => !result ? true : undefined))
		})
		const result = await pAny(promises);
		if (result) {
			this.editSetting();
		}
	}


	darkModeChange(event) {
		let systemDark = window.matchMedia("(prefers-color-scheme: dark)");
		systemDark.addListener(this.colorTest);
		if (event.detail.checked) {
			document.body.setAttribute('data-theme', 'dark');
		}
		else {
			document.body.setAttribute('data-theme', 'light');
		}
	}
	colorTest(systemInitiatedDark) {
		if (systemInitiatedDark.matches) {
			document.body.setAttribute('data-theme', 'dark');
		} else {
			document.body.setAttribute('data-theme', 'light');
		}
	}

	editSetting() {
		this.presentModal()
	}

	async presentModal() {
		const modal = await this.modalController.create({
			component: SettingModalComponent,
			cssClass: 'setting-modal',
			animated: false,
			componentProps: {
				rcloneConf: this.configs
			}
		});
		return await modal.present();
	}
}
