import { app, BrowserWindow, ipcMain, screen, dialog, Menu, globalShortcut } from 'electron'
import { exec, spawn, execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { ipfsGateway } from './database';
// Show message box function
export function showMessageBox(options, win = null) {
	dialog.showMessageBox(win, options).then(result => {
		console.log(result.response);
	}).catch(err => { console.log(err) });
}

// Rewrite vietnamese function
export function nonAccentVietnamese(str) {
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
	str = str.replace(/ƀ/g, "b");
	str = str.replace(/č/g, "c");
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ĕ|ê|ề|ế|ệ|ể|ễ|ê̆/g, "e");
	str = str.replace(/ì|í|ị|ỉ|ĩ|ĭ/g, "i");
	str = str.replace(/ò|ó|ọ|ỏ|õ|ŏ|ô|ồ|ố|ộ|ổ|ỗ|ô̆|ơ|ờ|ớ|ợ|ở|ỡ|ơ̆/g, "o");
	str = str.replace(/ù|ú|ụ|ủ|ũ|ŭ|ư|ừ|ứ|ự|ử|ữ|ư̆/g, "u");
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
	str = str.replace(/đ/g, "d");
	str = str.replace(/ñ/g, "n");

	str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
	str = str.replace(/Ƀ/g, "B");
	str = str.replace(/Č/g, "C");
	str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ĕ|Ê̆|Ề|Ế|Ệ|Ể|Ễ/g, "E");
	str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ|Ĭ/g, "I");
	str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ|Ŏ|Ơ̆|Ô̆/g, "O");
	str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ŭ|Ư|Ừ|Ứ|Ự|Ử|Ữ|Ư̆/g, "U");
	str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
	str = str.replace(/Đ|Ð/g, "D");
	str = str.replace(/Ñ/g, "N");
	// Some system encode vietnamese combining accent as individual utf-8 characters
	str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
	str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
	// str = str.replace(/-+-/g, "-"); //thay thế 2- thành 1- 
	return str;
}

export const packCar = async (input, output) => {
	console.log('packing Car:', input, output);
	return new Promise(async (resolve, reject) => {
		if (fs.existsSync(output)) await fs.unlinkSync(output);
		await execSync(`ipfs-car --wrapWithDirectory false --pack '${input}' --output '${output}'`);
		console.log('packed car done');
		resolve(true);
	})
}


// uploadIPFS function
export const uploadIPFS = async (srcPath, type) => {
	return new Promise(async (resolve) => {
		try {
			const gwStatus = await ipfsGWCheck(ipfsGateway);
			if (gwStatus) {
				const carPath = path.join(os.tmpdir(), 'vgm', `${path.basename(srcPath)}-${type}.car`);
				await packCar(srcPath, carPath);
				console.log('uploadingIPFS:', carPath);
				console.time(path.parse(carPath).name)
				// add via dag import
				exec(`curl -X POST -F file=@'${carPath}' "${ipfsGateway}/api/v0/dag/import"`, async (err, stdout, stderr) => {
					if (stdout) {
						const cid = JSON.parse(stdout).Root.Cid["/"];
						console.timeEnd(path.parse(carPath).name)
						await fs.unlinkSync(carPath);
						resolve(cid.toString());
					}
					if (err) {
						console.timeEnd(path.parse(carPath).name)
						await fs.unlinkSync(carPath);
						resolve(false);
					}
				})
			}
			resolve(false);
		} catch (error) {
			console.log(error);
			resolve(false);
		}
	});
}

export const rcloneSync = async (source, des, confPath?) => {
	console.log('Rclone sync:', `'${source}/'`, `'${des}/'`, `--config '${confPath}'`);
	return new Promise((resolve) => {
		const rclone = spawn('rclone', ['copy', '--progress', '--config', `${confPath}`, `${source}/`, `${des}/`], { detached: true });
		rclone.stdout.on('data', async (data) => {
			console.log(`rclone sync stdout: ${data}`);
		});
		rclone.stderr.on('data', async (data) => {
			console.log(`Stderr: ${data}`);
		});
		rclone.on('close', async (code) => {
			console.log(`Rclone sync file done with code:`, code);
			resolve('done');
		})
	});
}


export const s3ConfWrite = async (config) => {
	return new Promise(async (resolve) => {
		const confPath = path.join(os.tmpdir(), 'vgm', `${config.name}.conf`);
		let data = `[${config.name}]\n`
		Object.getOwnPropertyNames(config).forEach((val, index, array) => {
			if (val !== 'id' && val !== 'status' && val !== 'name' && val !== 'bucket') {
				data = data + `${val} = ${config[val]}\n`
			}
		});
		await fs.writeFileSync(confPath, data);
		resolve('done');
	})
}

export const s3ConnCheck = async (config) => {
	return new Promise(async (resolve) => {
		exec(`rclone lsd --config="${config.path}" ${config.name}:`, { timeout: 15000 }, (error, stdout, stderr) => {
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
