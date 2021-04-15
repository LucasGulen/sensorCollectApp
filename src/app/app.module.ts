import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { DeviceMotion } from '@ionic-native/device-motion/ngx';
import { Gyroscope } from '@ionic-native/gyroscope/ngx';
import { Magnetometer } from '@ionic-native/magnetometer/ngx';


import { FormsModule } from '@angular/forms';
import { File } from '@ionic-native/file/ngx';
import { ForegroundService } from '@ionic-native/foreground-service/ngx';
import { PowerManagement } from '@ionic-native/power-management/ngx';
import {ModalUsecaseComponent} from './pages/modalUsecase/modalUsecase.component';

import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import {AngularFirestore, AngularFirestoreModule, FirestoreSettingsToken} from '@angular/fire/firestore';
import {AuthServiceService} from './services/auth/auth-service.service';
import { AngularFireAuth } from '@angular/fire/auth';
import {UserService} from './services/user/user.service';
import {TravelService} from './services/travel/travel.service';
import {AngularFireMessaging, AngularFireMessagingModule} from '@angular/fire/messaging';
import {FCM} from '@ionic-native/fcm/ngx';
import {NativePageTransitions} from '@ionic-native/native-page-transitions/ngx';



@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireMessagingModule
  ],
  declarations: [AppComponent, ModalUsecaseComponent],
  entryComponents: [ModalUsecaseComponent],
  providers: [
      SplashScreen,
      AuthServiceService,
      UserService,
      TravelService,
      AngularFireAuth,
      StatusBar,
      DeviceMotion,
      Gyroscope,
      File,
      Magnetometer,
      ForegroundService,
      PowerManagement,
      AngularFirestore,
      AngularFireMessaging,
      NativePageTransitions,
      FCM,
      { provide: FirestoreSettingsToken, useValue: {} }
    ],
  bootstrap: [AppComponent]
})
export class AppModule {}
