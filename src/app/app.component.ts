import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { MenuController, Platform, ToastController } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Storage } from '@ionic/storage';
import {UseCase} from './metier/usecase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  constructor(
      private menu: MenuController,
      private platform: Platform,
      private router: Router,
      private splashScreen: SplashScreen,
      private statusBar: StatusBar,
      private storage: Storage,
      private toastCtrl: ToastController
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.router.navigateByUrl('/login');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
  }
}
