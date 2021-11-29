const {  spawn } = require('child_process');


const main = async () => { 
	const mp4Tmp = '/home/vgm/Desktop/SuDoPhiero-SuCuuChuoc-pd.mp4';
	const tmpPath = '/home/vgm/Desktop/test123.mp4';
	const mp4 = spawn('ffmpeg', ['-vsync', '0', '-i', `${mp4Tmp}`, '-c:v', 'h264_nvenc', '-filter:v', 'pad=ih*16/9:ih:(ow-iw)/2:(oh-ih)/2', '-c:a', 'copy', `${tmpPath}`]);
	mp4.stdout.on('data', async (data) => {
                console.log(`converting to mp4 stdout: ${data}`);
              });
              mp4.stderr.on('data', async (data) => {
                console.log(`Stderr: ${data}`);
              });
              mp4.on('close', async (code) => {
                console.log(`Converted to mp4 done with code:`, code);
                // await fs.unlinkSync(mp4Tmp);
                // resolve(true);
              })
}
main();
