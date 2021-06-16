import { Component } from '@angular/core';

@Component({
  selector: 'vgm-converter-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor() { }
  tabDatabase = true;
  tabConverter = false;
  tabIPFS = false;

  tabSelect(tab: string) {
    switch (tab) {
      case 'database':
        this.tabConverter = false;
        this.tabDatabase = true;
        this.tabIPFS = false;
        break;
      case 'converter':
        this.tabDatabase = false;
        this.tabConverter = true;
        this.tabIPFS = false;
        break;
      case 'ipfs':
        this.tabDatabase = false;
        this.tabConverter = false;
        this.tabIPFS = true;
        break;
      default:
        this.tabDatabase = true;
        this.tabConverter = false;
        this.tabIPFS = false;
    }
  }

}
