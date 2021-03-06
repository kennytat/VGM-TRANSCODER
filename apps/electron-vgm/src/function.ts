import { dialog } from 'electron'
import { exec, spawn, execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as pinyin from 'chinese-to-pinyin';
import * as md5 from 'md5-file';
import { ipfsGateway } from './database';
import { tmpDir } from './index';


export const s3ConfWrite = async (config) => {
	return new Promise(async (resolve) => {
		const confPath = path.join(tmpDir, `${config.name}.conf`);
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

// Show message box function
export function showMessageBox(options, win = null) {
	dialog.showMessageBox(win, options).then(result => {
		console.log(result.response);
	}).catch(err => { console.log(err) });
}

export async function md5Checksum(filePath) {
	console.log('checksum called:', filePath);
	return await md5(filePath);
}

// Rewrite vietnamese function
export function langToLatin(str) {
	str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "a");
	str = str.replace(/??/g, "b");
	str = str.replace(/??/g, "c");
	str = str.replace(/??|??|???|???|???|??|??|???|???|???|???|???|????/g, "e");
	str = str.replace(/??|??|???|???|??|??/g, "i");
	str = str.replace(/??|??|???|???|??|??|??|???|???|???|???|???|????|??|???|???|???|???|???|????/g, "o");
	str = str.replace(/??|??|???|???|??|??|??|???|???|???|???|???|????/g, "u");
	str = str.replace(/???|??|???|???|???/g, "y");
	str = str.replace(/??/g, "d");
	str = str.replace(/??/g, "n");

	str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "A");
	str = str.replace(/??/g, "B");
	str = str.replace(/??/g, "C");
	str = str.replace(/??|??|???|???|???|??|??|????|???|???|???|???|???/g, "E");
	str = str.replace(/??|??|???|???|??|??/g, "I");
	str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???|??|????|????/g, "O");
	str = str.replace(/??|??|???|???|??|??|??|???|???|???|???|???|????/g, "U");
	str = str.replace(/???|??|???|???|???/g, "Y");
	str = str.replace(/??|??/g, "D");
	str = str.replace(/??/g, "N");
	// Some system encode vietnamese combining accent as individual utf-8 characters
	str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huy???n s???c h???i ng?? n???ng 
	str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ??, ??, ??, ??, ??
	// non chinese characters
	str = pinyin(str, { removeTone: true, keepRest: true })
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
			console.log(ipfsGateway);

			if (gwStatus) {
				const carPath = path.join(tmpDir, `${path.basename(srcPath)}-${type}.car`);
				await packCar(srcPath, carPath);
				console.log('uploadingIPFS:', carPath);
				console.time(path.parse(carPath).name)
				resolve(false);
				// add via dag import
				// exec(`curl -X POST -F file=@'${carPath}' "${ipfsGateway}/api/v0/dag/import"`, async (err, stdout, stderr) => {
				// 	if (stdout) {
				// 		const cid = JSON.parse(stdout).Root.Cid["/"];
				// 		console.timeEnd(path.parse(carPath).name)
				// 		await fs.unlinkSync(carPath);
				// 		resolve(cid.toString());
				// 	}
				// 	if (err) {
				// 		console.timeEnd(path.parse(carPath).name)
				// 		await fs.unlinkSync(carPath);
				// 		resolve(false);
				// 	}
				// })
			}
			resolve(false);
		} catch (error) {
			console.log(error);
			resolve(false);
		}
	});
}

export const rcloneSync = async (source, des, confPath, extraOption = []) => {
	const confOption = confPath ? ['--config', confPath] : [];
	console.log('Rclone copy:', `'${source}/'`, `'${des}/'`, confOption, extraOption);
	return new Promise((resolve) => {
		const rclone = spawn('rclone', ['copy', '--progress', `${source}/`, `${des}/`].concat(confOption).concat(extraOption), { detached: true });
		rclone.stdout.on('data', async (data) => {
			console.log(`rclone copy stdout: ${data}`);
		});
		rclone.stderr.on('data', async (data) => {
			console.log(`Stderr: ${data}`);
		});
		rclone.on('close', async (code) => {
			console.log(`Rclone copy file done with code:`, code);
			resolve('done');
		})
	});
}

export const rcloneDelete = async (des, confPath, extraOption = []) => {
	const confOption = confPath ? ['--config', confPath] : [];
	console.log('Rclone delete:', `'${des}/'`, confOption, extraOption);
	return new Promise((resolve) => {
		const rclone = spawn('rclone', ['delete', '--progress', `${des}/`].concat(confOption).concat(extraOption), { detached: true });
		rclone.stdout.on('data', async (data) => {
			console.log(`rclone delete stdout: ${data}`);
		});
		rclone.stderr.on('data', async (data) => {
			console.log(`Stderr: ${data}`);
		});
		rclone.on('close', async (code) => {
			console.log(`Rclone delete file done with code:`, code);
			resolve('done');
		})
	});
}