import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';


@Component({
  selector: 'vgm-converter-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  inputPath: string = "";
  outputPath: string = "";
  constructor(private _electronService: ElectronService) {}

  currDiv: string = 'A';
  ShowDiv(divVal: string) {
    this.currDiv = divVal;
  }

  public OpenDialog() {
    if(this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('open-file-dialog');   
      this._electronService.ipcRenderer.on('directory-path', (event, inpath)  => { this.inputPath = inpath[0];})    
    }
  }

  public SaveDialog() {
    if(this._electronService.isElectronApp) {
      this._electronService.ipcRenderer.send('save-dialog');   
      this._electronService.ipcRenderer.on('saved-path', (event, outpath)  => {this.outputPath = outpath[0];})
    } 
  }

  public Convert() {
    if(this._electronService.isElectronApp) {
      if (this.inputPath === "") {
        this._electronService.ipcRenderer.send('missing-path'); 
      } else {
        this._electronService.ipcRenderer.send('start-convert', [this.inputPath, this.outputPath]); 
      // this._electronService.ipcRenderer.on('saved-path', (event, outpath)  => {this.outputPath = outpath[0];})
      }
      
    } 
  }
}
