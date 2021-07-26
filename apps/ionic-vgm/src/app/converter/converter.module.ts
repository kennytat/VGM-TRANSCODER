import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { ConverterPage } from './converter.page';
import { ConverterPageRoutingModule } from './converter-routing.module';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ConverterPageRoutingModule,
  ],
  providers: [],
  declarations: [ConverterPage],
})

export class ConverterPageModule { }
