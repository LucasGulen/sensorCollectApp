import { Injectable } from '@angular/core';
import {TravelRecord} from '../../metier/travelRecord';
import * as firebase from 'firebase';
import {UseCase} from '../../metier/usecase';
import { AngularFirestore} from '@angular/fire/firestore';
import {User} from '../../metier/user';
import {parse} from 'ts-node';
import {stringify} from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  db = firebase.firestore();

  constructor(private afs: AngularFirestore) { }
/*
  saveTravel(travel: TravelRecord, usecase: UseCase, user: User, collectionPath: string) {
    this.db.collection('travels')
        .doc(travel.id)
        .set({
          usecaseId: usecase.id,
          usecaseName: usecase.label
        })
        .then(res => {
         this.saveFrames(travel, user, collectionPath);
        })
        .catch(error => {
          console.error('Error writing document: ', error);
        });
  }
  saveFrames(travel: TravelRecord, user: User, collectionPath: string) {
      this.db.collection('travels')
          .doc(travel.id)
          .collection(collectionPath)
          .doc(firebase.auth().currentUser.uid)
          .set({
              username: user.username
          })
          .then(res => {
              this.db.collection('travels')
                  .doc(travel.id)
                  .collection(collectionPath)
                  .doc(user.id)
                  .collection('collectedData')
                  .add({frames : JSON.parse(JSON.stringify(travel))});
          });
  }
*/


  initializeTravel(travel: TravelRecord, usecase: UseCase) {
      return this.db.collection('travels')
          .doc(travel.id)
          .set({
              usecaseId: usecase.id,
              usecaseName: usecase.label
          });
  }

  createId() {
      return this.afs.createId();
  }

  addPassenger(travel: TravelRecord, passenger: User) {
      return this.db.collection('travels')
          .doc(travel.id)
          .collection('passengers')
          .doc(passenger.id)
          .set({
              username: passenger.username
          });
  }

  addDriver(travel: TravelRecord, driver: User) {
    return this.db.collection('travels')
        .doc(travel.id)
        .collection('driver')
        .doc(driver.id)
        .set({
            username: driver.username
        });
  }

  addFrames(travel: TravelRecord, user: User, userCollectionPath: string) {
      return this.db.collection('travels')
          .doc(travel.id)
          .collection(userCollectionPath)
          .doc(user.id)
          .collection('collectedData')
          .add(JSON.parse(JSON.stringify(travel)));
  }

  removeDriver(travel: TravelRecord, driver: User) {
      return this.db.collection('travels')
          .doc(travel.id)
          .collection('driver')
          .doc(driver.id)
          .delete();
  }

  removePassenger(travel: TravelRecord, passenger: User) {
      return this.db.collection('travels')
          .doc(travel.id)
          .collection('passengers')
          .doc(passenger.id)
          .delete();
  }

  getTravel(idTravel: string) {
      return this.db.collection('travels').doc(idTravel).get();
  }

  getTravelDriver(idTravel: string) {
      return this.db.collection('travels').doc(idTravel).collection('driver').get();
  }

  getTravelFrames(idTravel: string, driverId: string) {
      return this.db.collection('travels').doc(idTravel).collection('driver').doc(driverId).collection('frames').get();
  }
}
