import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabasePage } from './database.page';
import { DatabasePageRoutingModule } from './database-routing.module';
import { TreeviewModule } from 'ngx-treeview';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    DatabasePageRoutingModule,
    TreeviewModule.forRoot()
  ],
  declarations: [DatabasePage],
})
export class DatabasePageModule { }
