import { Component } from '@angular/core';

@Component({
  selector: 'vgm-converter-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor() {}
  tabConverter = true;
  tabDatabase = false;
  tabIPFS = false;

  tabSelect(tab:string) {
    switch(tab) {
        case "converter":
          this.tabConverter = true; 
          this.tabDatabase = false;
          this.tabIPFS = false;
        break; 
        case "database":
          this.tabConverter = false;
          this.tabDatabase = true;
          this.tabIPFS = false;
        break;
        case "ipfs":
          this.tabConverter = false;
          this.tabDatabase = false;
          this.tabIPFS = true;
        break;
        default:
          this.tabConverter = true;
          this.tabDatabase = false;
          this.tabIPFS = false;
     }
  }

}
