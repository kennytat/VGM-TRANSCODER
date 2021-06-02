import { Component, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';


@Component({
  selector: 'vgm-converter-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  inputPath: string = "";
  outputPath: string = "";
  // electronService API for ipcMain and ipcRenderer communication, ngZone for immediately reflect data change from ipcMain sender
  constructor(private _electronService: ElectronService, private zone:NgZone)  {}


  public OpenDialog() {
    if(this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('open-file-dialog');   
      this._electronService.ipcRenderer.on('directory-path', (event, inpath)  => { 
        this.zone.run(()=>{
          this.inputPath = inpath[0];
       });
      })    
    }
  }

  public SaveDialog() {
    if(this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('save-dialog');   
      this._electronService.ipcRenderer.on('saved-path', (event, outpath)  => {
        this.zone.run(()=>{
          this.outputPath = outpath[0];
       });
      })
    } 
  }

  convert_button:boolean = true;
  progress_loading:boolean = false;
  btn_disable:boolean = false;
  progression_status:number = 0;
  converted_files:number = 0;
  total_files:number = 0;
  public Convert() {   
    if(this._electronService.isElectronApp) {
      if (this.inputPath === "") {
        this._electronService.ipcRenderer.send('missing-path'); 
      } else {     
        this._electronService.ipcRenderer.send('start-convert', [this.inputPath, this.outputPath]);
        this._electronService.ipcRenderer.on('exec-done', (event)  => {
          this.zone.run(()=>{
            this.convert_button = true;
            this.btn_disable = false;
            this.progress_loading = false;
            this.inputPath = "";
            this.outputPath = "";   
         });
        });

        this._electronService.ipcRenderer.on('progression', (event, arg1, arg2, arg3)  => {
          this.zone.run(()=>{
            this.progression_status = arg1;
            this.converted_files = arg2;
            this.total_files = arg3;
            if (this.progression_status > 0.99) {
              this.progress_loading = true;
            } else {
              this.progress_loading = false;
            }
         });
        }); 
        
        this.convert_button = false;
        this.btn_disable = true;
      };   
      
    } 
  }
  
  public Cancel() {
    if(this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('stop-convert');   
      this.convert_button = true;  
      this.btn_disable = false;
      this.zone.run(()=>{
          this.inputPath = "";
          this.outputPath = "";
       })
    } 
  }
}
