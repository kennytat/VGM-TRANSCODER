import { Injectable } from '@angular/core';
import { LocalforageService } from '../services/localforage.service';
import { S3Conf } from '../models';
import * as pAll from 'p-all';
import { ElectronService } from 'ngx-electron';


@Injectable({
	providedIn: 'root',
})
export class ConfigService {
	warehouseConf: S3Conf = {
		id: 'warehouse',
		name: '',
		type: '',
		provider: '',
		access_key_id: '',
		secret_access_key: '',
		endpoint: '',
		acl: '',
		bucket: ''
	};
	encryptedConf: S3Conf = {
		id: 'encrypted',
		name: '',
		type: '',
		provider: '',
		access_key_id: '',
		secret_access_key: '',
		endpoint: '',
		acl: '',
		bucket: ''
	};
	ipfsAPIGateway = {
		id: 'ipfs',
		name: '',
		gateway: '',
	};
	searchGateway = {
		id: 'search',
		name: '',
		gateway: '',
		key: ''
	};
	dnsGateway = {
		id: 'dns',
		name: '',
		domain: '',
		cf_gateway: '',
		cf_zone_id: '',
		cf_dns_id: '',
		cf_email: '',
		cf_api: '',
	};

	configs = [this.warehouseConf, this.encryptedConf, this.ipfsAPIGateway, this.searchGateway, this.dnsGateway];
	confStat = false;
	constructor(
		private _localForage: LocalforageService,
		private _electronService: ElectronService,
	) { }

	async confCheck() {
		try {
			let promises = [];
			for (let i = 0; i < this.configs.length; i++) {
				promises.push(this._localForage.get(this.configs[i].id).then(
					async (result) => {
						if (result) {
							this.configs[i] = result;
							console.log('got conf:', this.configs[i]);
							return await this.connCheck(this.configs[i]);
						} else {
							await this._localForage.set(this.configs[i].id, this.configs[i]);
							return result;
						}
					}))
			}
			const confValid = await pAll(promises, { concurrency: 3 });
			if (confValid) {
				this.confStat = true;
				return true;
			}
			return false;
		} catch (error) {
			return false;
		}
	}

	async connCheck(config) {
		return new Promise((resolve) => {
			if (this._electronService.isElectronApp) {
				this._electronService.ipcRenderer.invoke('check-conf', config).then((conf) => {
					console.log(`connection of ${config.id}:`, conf);
					resolve(conf)
				})
			}
		})
	}

}
