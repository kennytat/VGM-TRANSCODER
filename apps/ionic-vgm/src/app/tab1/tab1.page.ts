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

  currDiv: string = 'A';
  ShowDiv(divVal: string) {
    this.currDiv = divVal;
  }

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
  btn_disable:boolean = false;
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
    } 
  }

}
