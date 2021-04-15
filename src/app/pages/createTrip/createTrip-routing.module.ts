import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {CreateTripPage} from './createTrip';

const routes: Routes = [
  {
    path: '',
    component: CreateTripPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateTripRoutingModule { }
