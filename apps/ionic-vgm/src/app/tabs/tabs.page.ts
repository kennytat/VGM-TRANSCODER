import { Component } from '@angular/core';

@Component({
  selector: 'vgm-converter-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  constructor() {}
  tabDatabase = true;
  tabConverter = false;
  tab3 = false;

  tabSelect(tab:string) {
    switch(tab) {
        case "database":
          this.tabDatabase = true;
          this.tabConverter = false;
          this.tab3 = false;
        break;
        case "converter":
          this.tabDatabase = false;
          this.tabConverter = true; 
          this.tab3 = false;
        break;
        case "tab3":
          this.tabDatabase = false;
          this.tabConverter = false;
          this.tab3 = true;
        break;
        default:
          this.tabDatabase = true;
          this.tabConverter = false;
          this.tab3 = false;
     }
  }

}
