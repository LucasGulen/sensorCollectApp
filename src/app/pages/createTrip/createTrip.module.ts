import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateTripPage } from './createTrip';
import { CreateTripRoutingModule } from './createTrip-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateTripRoutingModule
  ],
  declarations: [
    CreateTripPage
  ]
})
export class CreateTripModule { }
