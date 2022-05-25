import { app, dialog, ipcMain } from 'electron'
import { exec, spawn, execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { showMessageBox } from './function';
import { win } from './index';

export interface FileInfo {
	pid: string,
	name: string,
	size: number,
	md5: string,
	duration: string,
	qm: string,
	url: string,
	hash: string,
	khash: string,
	isVideo: boolean,
	dblevel: number
}

export let warehouseConf = {
	path: '',
	name: '',
	bucket: ''
};
export let encryptedConf = {
	path: '',
	name: '',
	bucket: ''
};
export let ipfsGateway = '';

export const s3ConfWrite = async (config) => {
	return new Promise(async (resolve) => {
		const confPath = path.join(app.getPath('temp'), `${config.name}.conf`);
		let data = `[${config.name}]\n`
		Object.getOwnPropertyNames(config).forEach((val, index, array) => {
			if (val !== 'id' && val !== 'name' && val !== 'bucket') {
				data = data + `${val} = ${config[val]}\n`
			}
		});
		await fs.writeFileSync(confPath, data);
		resolve('done');
	})
}

export const s3ConnCheck = async (config) => {
	return new Promise(async (resolve) => {
		exec(`rclone lsd --config="${config.path}" ${config.name}:${config.bucket}`, { timeout: 15000 }, (error, stdout, stderr) => {
			if (error) resolve(false);
			resolve(true);
		})
	})
}

export const ipfsGWCheck = async (gateway) => {
	return new Promise(resolve => {
		exec(`curl -X POST "${gateway}/api/v0/id"`, { timeout: 5000 }, (error, stdout, stderr) => {
			if (error) resolve(false);
			resolve(true);
		})
	})
}

export const searchGWCheck = async (gateway) => {
	return new Promise(resolve => {
		resolve(false);
		// exec(`curl -X POST "${gateway}/api/v0/id"`, { timeout: 5000 }, (error, stdout, stderr) => {
		// 	if (error) resolve(false);
		// 	resolve(true);
		// })
	})
}

export const dnsGWCheck = async (gateway) => {
	return new Promise(resolve => {
		resolve(false);
		// exec(`curl -X POST "${gateway}/api/v0/id"`, { timeout: 5000 }, (error, stdout, stderr) => {
		// 	if (error) resolve(false);
		// 	resolve(true);
		// })
	})
}

export const databaseService = () => {
	ipcMain.handle('check-conf', async (event, config) => {
		console.log('got conf:', config);
		let result;
		const confPath = path.join(app.getPath('temp'), `${config.name}.conf`);
		try {
			switch (config.id) {
				case "warehouse":
					warehouseConf.path = confPath;
					warehouseConf.name = config.name;
					warehouseConf.bucket = config.bucket;
					await s3ConfWrite(config);
					result = await s3ConnCheck(warehouseConf);
					break;
				case "encrypted":
					encryptedConf.path = confPath;
					encryptedConf.name = config.name;
					encryptedConf.bucket = config.bucket;
					await s3ConfWrite(config);
					result = await s3ConnCheck(encryptedConf);
					break;
				case "ipfs":
					ipfsGateway = config.gateway;
					result = await ipfsGWCheck(config.gateway);
					break;
				case "search":
					ipfsGateway = config.gateway;
					result = await searchGWCheck(config.gateway);
					break;
				case "dns":
					ipfsGateway = config.gateway;
					result = await dnsGWCheck(config.gateway);
					break;
				default:
					break;
			}
			return result;
		} catch (error) {
			throw error;
		}
	})


	ipcMain.handle('export-database', async (event, apiType: string, item, fileType) => {
		console.log('export-database called', item);
		const outPath = app.getPath('temp');
		const json = fileType === 'searchAPI' ? JSON.stringify(item) : JSON.stringify(item, null, 2);

		// handle file path
		let filePath: string;
		if (fileType === 'itemList') {
			filePath = path.join(outPath.toString(), `API-${apiType}`, 'items', 'list', `${item.url}.json`);
		} else if (fileType === 'itemSingle') {
			filePath = path.join(outPath.toString(), `API-${apiType}`, 'items', 'single', `${item.url}.json`);
		} else if (fileType === 'topicList') {
			filePath = path.join(outPath.toString(), `API-${apiType}`, 'topics', 'list', `${item.url}.json`);
		} else if (fileType === 'topicSingle') {
			filePath = path.join(outPath.toString(), `API-${apiType}`, 'topics', 'single', `${item.url}.json`);
		} else if (fileType === 'searchAPI') {
			filePath = path.join(outPath.toString(), `API-${apiType}`, `searchAPI.json`);
		} else if (fileType === 'apiVersion') {
			filePath = path.join(outPath.toString(), `API-${apiType}`, `apiVersion.json`);
		} else if (fileType === 'apiJson') {
			filePath = path.join(outPath.toString(), `API-${apiType}`, `instruction.json`);
		}
		const dir = path.dirname(filePath)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		await fs.writeFile(filePath, json, function (err) {
			if (err) throw err;
		});

		return 'done';
	})


	ipcMain.handle('upload-db-confirmation', async (event) => {
		try {
			let options = {
				type: 'question',
				buttons: ['Cancel', 'Upload'],
				defaultId: 0,
				title: 'Upload Database Confirmation',
				message: 'Do you want to upload your database online?',
				detail: 'This process will take approximately 15 mins!',
			}

			return await dialog.showMessageBox(win, options).then(result => {
				return result.response
			})
		} catch (error) {
			console.log(error);
			return null
		}
	})

	ipcMain.handle('exec-db-confirmation', async (event, method) => {
		try {
			let options;
			if (method === 'updateDB') {
				options = {
					type: 'question',
					buttons: ['Cancel', 'Update'],
					defaultId: 0,
					title: 'Update Confirmation',
					message: 'Are you sure want to update selected entries',
					detail: 'Update data will also update entries on network',
				}
			} else if (method === 'deleteDB') {
				options = {
					type: 'question',
					buttons: ['Cancel', 'Delete data'],
					defaultId: 0,
					title: 'Deletion Confirmation',
					message: 'Are you sure want to delete selected entries',
					detail: 'Delete data will also update entries on network',
				}
			}
			return await dialog.showMessageBox(win, options).then(result => {
				return { method: method, response: result.response }
			})
		} catch (error) {
			console.log(error);
			return null
		}
	})


	ipcMain.handle('exec-db-done', (event, message) => {
		const options = {
			type: 'info',
			title: 'Done',
			message: 'Your request have been executed sucessfully!',
			detail: message,
		};
		showMessageBox(options);
	})

	ipcMain.handle('update-dns', (event, api) => {
		const ls = exec(`curl -X PUT "https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONEID}/dns_records/${process.env.CF_DNSID}" \
     -H "X-Auth-Email: ${process.env.CF_EMAIL}" \
     -H "X-Auth-Key: ${process.env.CF_API}" \
     -H "Content-Type: application/json" \
     --data '{"type":"TXT","name":"_dnslink.find.hjm.bid","content":"dnslink=/ipfs/${api}","ttl":1,"proxied":false}' `, (error, stdout, stderr) => {
			if (error) {
				console.error(`Update CF Error: ${error}`);
				return error;
			}
			console.log(`Updated CF Record: ${stdout}`);
			return `update dns done: ${stdout}`;
		});

	});
}