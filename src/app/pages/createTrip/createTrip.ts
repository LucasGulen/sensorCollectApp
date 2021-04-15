import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Config, NavController, ModalController, AlertController} from '@ionic/angular';

import {User} from '../../metier/user';
import {SensorsUtils} from '../../providers/sensors-utils';
import {Gyroscope} from '@ionic-native/gyroscope/ngx';
import {DeviceMotion} from '@ionic-native/device-motion/ngx';
import { Magnetometer } from '@ionic-native/magnetometer/ngx';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { Papa } from 'ngx-papaparse';
import {HttpClient} from '@angular/common/http';
import { File } from '@ionic-native/file/ngx';
import {PowerManagement} from '@ionic-native/power-management/ngx';
import {ModalUsecaseComponent} from '../modalUsecase/modalUsecase.component';
import {UseCase} from '../../metier/usecase';
import {UserService} from '../../services/user/user.service';
import {TravelService} from '../../services/travel/travel.service';
import {FCM} from '@ionic-native/fcm/ngx';
import {Sensor} from '../../metier/sensor';
import {FrameRecord} from '../../metier/frameRecord';
// @ts-ignore
declare var cordova: Cordova;



@Component({
  selector: 'page-schedule',
  templateUrl: 'createTrip.html',
  styleUrls: ['./createTrip.css'],
})
export class CreateTripPage implements OnInit {
  ios: boolean;
  usersFiltered: Array<User> = new Array<User>();
  users: Array<User> = new Array<User>();
  selectedUsers: Array<User> = new Array<User>();

  csvArray: any[][] = [[]];
  headerRow: any[] = [
      'Accelerometer_x',
      'Accelerometer_y',
      'Accelerometer_z',
      'Gyroscope_x',
      'Gyroscope_y',
      'Gyroscope_z',
      'Magnetometer_x',
      'Magnetometer_y',
      'Magnetometer_z',
      'Magnitude',
      'timestamp',
      'driver',
      'travellers',
      'usecase'
  ];

  sensorManagement: SensorsUtils = new SensorsUtils(this.deviceMotion, this.gyroscope, this.deviceOrientation, this.travelService);
  intervalTime = 500; // Interval in ms to check sensors data

  startBtnColor = 'primary';
  stopBtnColor = 'danger';
  startBtnTxt = 'Start !';
  stopBtnTxt = 'Stop';
  start = false;
  backgroundOptions = {
    title: 'Carpooling sensors collection', text: 'Capturing accelerometer, gyroscope and magnetometer data...',
    hidden: true, silent: false
  };
  selectedUseCase: UseCase = new UseCase(-1, '');
  userConnected: User = new User('', '', '');
  driver: User = new User('', '', '');
  isDriver = true;
  useCaseDisabled = false;
  passengersDisabled = false;
  usecaseEmpty = false;
  isPassenger = false;
  confirmInvitation = false;
  backBtnSub;

  constructor(
    public router: Router,
    public config: Config,
    public deviceMotion: DeviceMotion,
    public gyroscope: Gyroscope,
    public deviceOrientation: Magnetometer,
    public storage: Storage,
    public powerManagement: PowerManagement,
    public platform: Platform,
    public parser: Papa,
    public http: HttpClient,
    public file: File,
    public modalController: ModalController,
    private userService: UserService,
    private travelService: TravelService,
    private activatedRoute: ActivatedRoute,
    private fcm: FCM,
    private alertController: AlertController
  ) {
  }

  ngOnInit() {
    this.ios = this.config.get('mode') === 'ios';
    this.storage.set('currentView', 'createTrip');
    this.userService.getCurrentUser().then( doc => {
      this.userConnected = new User(doc.id, doc.data().username, doc.data().notificationToken);
      this.initializeNotifications();
    });
    this.userService.getUsers().then( docs => {
      docs.forEach( doc => {
        const currentUser: User = new User(doc.id, doc.data().username, doc.data().notificationToken);
        this.users.push(currentUser);
        if (this.userConnected.id !== currentUser.id) {
          this.usersFiltered.push(currentUser);
        }
      });
    });
  }

  unsubscribePreventBackBtn() {
    this.platform.ready().then(() => {
      this.backBtnSub.unsubscribe();
    });
  }

  subscribePreventBackBtn() {
    this.platform.ready().then(() => {
      this.storage.get('currentView').then(async data => {
        console.log('enter in sub function');
        if (data === 'joinTrip') {
          console.log('enter in if sub function');
          this.backBtnSub = await this.platform.backButton.subscribeWithPriority(10, () => {
            this.resetAll();
            console.log('enter in if sub sub function');
          });
          console.log('unsub');
          this.backBtnSub = this.unsubscribePreventBackBtn();
        }
      });
    });
  }

  initializeNotifications() {
    // get FCM token
    this.fcm.getToken().then(token => {
      this.userService.setUser(this.userConnected.username, token);
      this.userConnected.tokenNotificationId = token;
    });

    // ionic push notification example
    this.fcm.onNotification().subscribe(data => {
      if (data.wasTapped) {
        this.presentInvitationConfirm(data.invitationFrom, data.travelToken);
      } else {
        this.presentInvitationConfirm(data.invitationFrom, data.travelToken);
      }
    });
    // refresh the FCM token
    this.fcm.onTokenRefresh().subscribe(token => {
      console.log(token);
    });
  }

  async loadInvitationData(travelId: string) {
    this.sensorManagement.travel.id = travelId;
    this.travelService.getTravel(travelId).then(doc => {
      console.log(doc.data());
      this.selectedUseCase = new UseCase(doc.data().usecaseId, doc.data().usecaseName);
      console.log(this.selectedUseCase);
      this.travelService.getTravelDriver(travelId).then( drivers => {
        this.travelService.addPassenger(this.sensorManagement.travel, this.userConnected);
      });
    });
    this.isDriver = false;
    this.useCaseDisabled = true;
    this.passengersDisabled = true;
  }

  exportCSV(travellers: Array<User>, frames: Array<FrameRecord>, timestamp: number) {
    const lineDelimiter = '\n';
    frames.forEach(frame => {
      const acceleration: Sensor = frame.sensors[0];
      const gyroscope: Sensor = frame.sensors[1];
      const magnetometer: Sensor = frame.sensors[2];

      const date: Date = new Date(frame.timestamp);
      const hour = date.getHours();
      const min = date.getMinutes();
      const sec = date.getSeconds();
      const debugDate = hour + ':' + min + ':' + sec;
      let travellersNames = '';

      travellers.forEach( traveller => travellersNames += ':' + traveller.username);
      travellersNames = travellersNames.substring(1); // Delete first ':' and use this seperator only between two travellers

      this.csvArray.push([
          acceleration.x,
          acceleration.y,
          acceleration.z,
          gyroscope.x,
          gyroscope.y,
          gyroscope.z,
          magnetometer.x,
          magnetometer.y,
          magnetometer.z,
          magnetometer.magnitude,
          debugDate,
          this.userConnected.username,
          travellersNames,
          this.selectedUseCase.id
      ]);

    });
    const csv = this.parser.unparse({
      fields: this.headerRow,
      data: this.csvArray
    });

    let path = null;
    if (this.platform.is('ios')) {
      path = this.file.documentsDirectory;
    } else if (this.platform.is('android') || this.platform.is('cordova')) {
      path = this.file.externalRootDirectory;
    }

    if (this.platform.is('cordova')) {
      const date: Date = new Date(timestamp);
      const day =  date.getDate();
      const month = date.getUTCMonth() + 1; // Months between 0 and 11
      const year = date.getFullYear();
      const hour = date.getHours();
      const min = date.getMinutes();
      const sec = date.getSeconds();
      const filename = 'travel_data_' + day + '_' + month + '_' + year + '_' + hour + '_' + min + '_' + sec + '.csv';
      this.file.writeFile(path, filename, csv, {replace: true}).then( res => {
        console.log('File saved : ', res);
      }, err => {
        console.log('Error: ', err);
      });
    }
  }

  public dimPM() {
    if (this.powerManagement) {
      console.log('powerManagement');
      this.powerManagement.dim().then((v) => {
        console.log('enablebackground: Wakelock acquired');
        this.powerManagement.setReleaseOnPause(false).then(() => {
          console.log('enablebackground: setReleaseOnPause success');
        }).catch(() => {
          console.log('enablebackground: setReleaseOnPause Failed to set');
        });
      }).catch((err) => {
        console.log('enablebackground: Failed to acquire wakelock:', err);
      });
    }
  }

  public disable_background_mode() {
    this.platform.ready().then(() => {
      console.log('plataform ready');
      cordova.plugins.backgroundMode.disable();
    });
  }

  public enable_background_mode() {
    this.platform.ready().then(() => {
      console.log('plataform ready');
      cordova.plugins.backgroundMode.setDefaults(this.backgroundOptions);
      cordova.plugins.backgroundMode.enable();
      cordova.plugins.backgroundMode.on('enable', () => {
        cordova.plugins.backgroundMode.disableWebViewOptimizations();
        cordova.plugins.backgroundMode.disableBatteryOptimizations();
        if (this.platform.is('android')) { this.dimPM(); }
      });

    });
  }

  selectPassenger(user: User, elem) {
    // Activate passenger selection only if all travel infos were given by the driver
    if (this.selectedUseCase.id >= 0) {
      this.usecaseEmpty = false;
      const idUser: string = elem.target.id;
      // If user was already selected, unselect him
      if (this.userAlreadySelected(user)) {
        elem.target.color = 'light';
        elem.target.childNodes[0].name = 'add-circle-outline';
        // Remove user from list
        const idxUser = this.selectedUsers.findIndex( usr => usr.id === idUser);
        this.selectedUsers.splice(idxUser, 1);
      } else {
        if (this.confirmInvitation) {
          // send invitation
          this.sendInvitation(user);
          elem.target.color = 'success';
          elem.target.childNodes[0].name = 'checkmark';
          // Add user to list
          this.selectedUsers.push(this.users.find( usr => usr.id === idUser));
        }
      }
    } else {
      this.usecaseEmpty = true;
    }
  }

  userAlreadySelected(user: User) {
    return this.selectedUsers.find( usr => usr.id === user.id) !== undefined;
  }

  driverCheckboxClick(event) {
    this.isDriver = event.target.checked;
  }

  toggleStart() {
    // L'utilisateur veut commencer le voyage
    if (!this.start) {
      this.enable_background_mode();
      // On lance l'enregistrement des capteurs
      this.sensorManagement.startTravel(this.selectedUsers, this.intervalTime);
    } else {
      /*
      // Save the travel in firebase
      if (this.isDriver) {
        this.travelService.addFrames(this.sensorManagement.travel, this.userConnected, 'driver');
      } else {
        this.travelService.addFrames(this.sensorManagement.travel, this.userConnected, 'passengers');
      }
      */
      this.sensorManagement.stopTravel();
      this.exportCSV(this.sensorManagement.travel.travellers, this.sensorManagement.travel.frames, this.sensorManagement.travel.timestampStop);
      this.resetAll();
      this.csvArray = [[]];
      this.disable_background_mode();
    }
    this.start = !this.start;
  }

  resetAll() {
    this.selectedUsers = new Array<User>();
    this.selectedUseCase = new UseCase(-1, '');
    this.intervalTime = 500;
    this.isDriver = true;
    this.isPassenger = false;
    this.useCaseDisabled = false;
    this.passengersDisabled = false;
    this.sensorManagement = new SensorsUtils(this.deviceMotion, this.gyroscope, this.deviceOrientation, this.travelService);
    this.storage.set('currentView', 'createTrip');
  }

  sendInvitation(user) {
    this.userService.sendNotification(user, this.sensorManagement.travel, this.userConnected.username);
  }

  async openUsecaseModal() {
    this.storage.set('selectedUseCaseId', this.selectedUseCase.id);
    const modal = await this.modalController.create({
      component: ModalUsecaseComponent,
      swipeToClose: true
    });

    modal.onDidDismiss()
        .then(data => {
          if (data.data !== undefined) {
            this.usecaseEmpty = false;
            this.selectedUseCase = data.data;
            // Initialize the travel and the driver in firebase
            this.travelService.initializeTravel(this.sensorManagement.travel, this.selectedUseCase);
            this.travelService.addDriver(this.sensorManagement.travel, this.userConnected);
          }
        });
    return await modal.present();
  }

  async presentInvitationConfirm(usernameInvitation: string, tokenTravel: string) {
    const alert = await this.alertController.create({
      header: 'Carpooling invite received',
      message: usernameInvitation + ' invite you to join his vehicle !',
      cssClass: 'invitationConfirm',
      buttons: [
        {
          text: 'Reject',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Cancel the invitation');
          }
        }, {
          text: 'Accept',
          handler: () => {
            this.storage.set('currentView', 'joinTrip');
            // this.subscribePreventBackBtn();
            this.isPassenger = true;
            this.driver.username = usernameInvitation;
            this.loadInvitationData(tokenTravel);
            console.log('Confirm the invitation for travel n° ', tokenTravel);
          }
        }
      ]
    });

    return await alert.present();
  }

  async sendInvitationConfirmation(userToInvite: User, event) {
    const alert = await this.alertController.create({
      header: 'Send carpooling invitation',
      message: 'You will invite ' + userToInvite.username + ' to do carpooling with you, is it what you want to do ?',
      cssClass: 'invitationConfirm',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary', handler: () => {
            alert.dismiss().then(() => {
              this.confirmInvitation = false;
            });
          }
        }, {
          text: 'Confirm',
          handler: () => {
            alert.dismiss().then(() => {
              this.confirmInvitation = true;
            });
          }
        }
      ]
    });
    await alert.present();

    alert.onDidDismiss().then((res) => {
      if (this.confirmInvitation) {
        this.selectPassenger(userToInvite, event);
      }
    });
  }


}
