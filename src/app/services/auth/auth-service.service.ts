import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(public afAuth: AngularFireAuth, private router: Router) {}

  doRegister(email: string, password: string) {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(
              res => {
                  resolve(res);
              },
              err => reject(err));
    });
  }

  doLogin(email: string, password: string) {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password)
          .then(
              res => {
                resolve(res);
              },
              err => {
                reject(err);
              }
          );
    });
  }

  doLogout() {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signOut()
          .then(() => {
            resolve();
          }).catch((error) => {
        reject();
      });
    });
  }
}
