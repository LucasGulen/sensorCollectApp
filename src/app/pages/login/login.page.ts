import { Component, OnInit } from '@angular/core';
import {AuthServiceService} from '../../services/auth/auth-service.service';
import {UserService} from '../../services/user/user.service';
import {Router} from '@angular/router';
import {AlertController, Platform, NavController} from '@ionic/angular';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions/ngx';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username = '';
  email = '';
  pass = '123456';
  currentPlaceHolder = 'Username';
  isLogging = false;

  constructor(
      private authService: AuthServiceService,
      private userService: UserService,
      private router: Router,
      private alertController: AlertController,
      private nativePageTransitions: NativePageTransitions,
      private platform: Platform,
      private storage: Storage
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribe(() => {
        this.storage.get('currentView').then( data => {
          if (data === 'createTrip') {
            this.storage.clear();
            this.logout();
          }
        });
      });
    });
  }

  usernameInputClick(event) {
    if (this.currentPlaceHolder === '') {
      this.currentPlaceHolder = 'Username';
    } else {
      this.currentPlaceHolder = '';
    }
  }

  login() {
    this.isLogging = true;
    // First bind the username entered with the firebase email account of the user
    this.userService.getUserBind(this.username).then( docs => {
      docs.forEach(doc => {
        console.log(doc.data().username);
        if (doc.data().username === this.username) {
          this.email = doc.data().email;
        }
      });
      // Then try to authenticate the user
      this.authService.doLogin(this.email, this.pass)
          .then( res => {
            this.userService.setUser(this.username, '');
            this.router.navigateByUrl('createTrip');
            this.isLogging = false;
            // Create a smooth transition to main page

          }).catch(
          err => {
            // Show modal to inform user of wrong credentials
            this.isLogging = false;
            this.loginFailed();
          }
      );
    });
  }

  logout() {
    this.email = '';
    this.authService.doLogout();
  }

  async loginFailed() {
    const alert = await this.alertController.create({
      header: 'Authentification échouée',
      message: 'Le nom d\'utilisateur entré est erroné. Veuillez réessayer ou contacter un administrateur.',
      cssClass: 'invitationConfirm',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary'
        }
      ]
    });

    return await alert.present();
  }

  ionViewWillEnter() {
    this.logout();
  }

  ionViewWillLeave() {

    const options: NativeTransitionOptions = {
      direction: 'left',
      duration: 600,
      slowdownfactor: 2
    }

    this.nativePageTransitions.flip(options)
        .then(onSuccess => {
          console.log(onSuccess);
        })
        .catch(onError => {
          console.log(onError);
        });

  }


}
