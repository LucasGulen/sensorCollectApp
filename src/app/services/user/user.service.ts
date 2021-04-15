import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import {User} from '../../metier/user';
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;
import DocumentData = firebase.firestore.DocumentData;
import QuerySnapshot = firebase.firestore.QuerySnapshot;
import {TravelRecord} from '../../metier/travelRecord';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  db = firebase.firestore();
  // Dev URL
  // fonctionsAPI = 'http://127.0.0.1:5000/sensor-collection/us-central1';
  // Prod URL
  fonctionsAPI = 'https://us-central1-sensor-collection.cloudfunctions.net/sendNotification';
  notificationRoute = '/sendNotification';

  constructor(private http: HttpClient) {}

  setUser(username: string, userNotificationToken: string) {
    this.db.collection('users').doc(firebase.auth().currentUser.uid).set({username, notificationToken: userNotificationToken});
  }

  getCurrentUser(): Promise<DocumentSnapshot> {
    const docRef = this.db.collection('users').doc(firebase.auth().currentUser.uid);
    return docRef.get();
  }

  getUsers(): Promise<QuerySnapshot<DocumentData>> {
      const usersCollection: Array<User> = new Array<User>();
      return this.db.collection('users').get();
  }

  getUserBind(username: string) {
    return this.db.collection('emailToUsername').get();
  }

  sendNotification(userToSend: User, travel: TravelRecord, usernameSender) {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json' );
    headers.append('Access-Control-Allow-Origin', '*' );


    const postData = {
      destinationToken: userToSend.tokenNotificationId,
      username: usernameSender,
      travelToken: travel.id
    };

    this.http.post(this.fonctionsAPI + this.notificationRoute, postData, {headers})
        .subscribe(data => {
          console.log(data);
        }, error => {
          console.log(error);
        });
  }

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
        'Something bad happened; please try again later.');
  }
}
