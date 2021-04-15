import {FrameRecord} from '../metier/frameRecord';
import {DeviceMotion, DeviceMotionAccelerationData} from '@ionic-native/device-motion/ngx';
import {Gyroscope, GyroscopeOrientation} from '@ionic-native/gyroscope/ngx';
import { Magnetometer, MagnetometerReading } from '@ionic-native/magnetometer/ngx';

import {TravelRecord} from '../metier/travelRecord';
import {Sensor} from '../metier/sensor';
import {User} from '../metier/user';
import Timeout = NodeJS.Timer;
import {TravelService} from '../services/travel/travel.service';
import {last} from 'rxjs/operators';


class SensorsUtils {
  travel = new TravelRecord();
  timestampDiff: number;

  // Gyroscope parameters
  private gyroscopeSub;
  gyroscopeData;

  // Accelerometer parameters
  private accelerometerSub;
  accelerometerData;

  // Magnetometer parameters
  private magnetometerSub;
  magnetomererData;

  private intervalId: Timeout;

  constructor(
    public deviceMotion: DeviceMotion,
    public gyroscope: Gyroscope,
    public deviceOrientation: Magnetometer,
    public travelService: TravelService
  ) {
      const date: number = new Date().getTime();
      this.accelerometerData = new Sensor(-1, 0, 0, 0, date);
      this.magnetomererData =  new Sensor(-1, 0, 0, 0, date);
      this.gyroscopeData = new Sensor(-1, 0, 0, 0, date);
      this.travel.id = this.travelService.createId();
  }

   startTravel(lstUsers: Array<User>, intervalTime: number) {
       this.watchGyroscope(intervalTime);
       this.watchAccelerometer(intervalTime);
       this.watchMagnetometer(intervalTime);
       const lastId = this.travel.id;
       this.travel = new TravelRecord();
       if (lastId === '' || lastId === undefined) {
           this.travel.id = this.travelService.createId();
       } else {
           this.travel.id = lastId;
       }
       this.travel.travellers = lstUsers;
       this.travel.timestampStart = new Date().getTime();
      // this.intervalId = setInterval(() => this.setSensorsValues(), intervalTime);
  }

  stopTravel() {
      this.unsubscribeGyroscope();
      this.unsubscribeAccelerometer();
      this.unsubscribeMagnetometer();
      this.travel.timestampStop = new Date().getTime();
      // clearInterval(this.intervalId);
  }

  async setSensorsValues() {
    // set values for all sensors
   await Promise.all([this.accelerometerValues(), this.gyroscopeValues()]);
   this.timestampDiff = this.gyroscopeData.timestamp - this.accelerometerData.timestamp;
   const timestamp = this.gyroscopeData.timestamp - this.accelerometerData.timestamp % 2;
   this.travel.frames.push(new FrameRecord(timestamp,  [this.accelerometerData, this.gyroscopeData, this.magnetomererData]));
  }

  accelerometerValues() {
    // Get the device current acceleration
    this.deviceMotion.getCurrentAcceleration().then(
      (acceleration: DeviceMotionAccelerationData) => {
        this.accelerometerData.x = parseFloat(acceleration.x.toFixed(2));
        this.accelerometerData.y = parseFloat(acceleration.y.toFixed(2));
        this.accelerometerData.z = parseFloat(acceleration.z.toFixed(2));
        this.accelerometerData.timestamp = acceleration.timestamp;
      },
      (error: any) => console.log(error)
    );
  }

  gyroscopeValues() {
    this.gyroscope.getCurrent()
      .then((orientation: GyroscopeOrientation) => {
          this.gyroscopeData.x = parseFloat(orientation.x.toFixed(2));
          this.gyroscopeData.y = parseFloat(orientation.y.toFixed(2));
          this.gyroscopeData.z = parseFloat(orientation.z.toFixed(2));
          this.gyroscopeData.timestamp = orientation.timestamp;
          },
        (error: any) => console.log(error)
      );
  }

  watchAccelerometer(intervalTime: number) {
    // Watch device acceleration
    // tslint:disable-next-line:max-line-length
      this.accelerometerSub = this.deviceMotion.watchAcceleration({frequency: intervalTime}).subscribe((acceleration: DeviceMotionAccelerationData) => {
            this.accelerometerData = new Sensor(-1, parseFloat(acceleration.x.toFixed(6)), parseFloat(acceleration.y.toFixed(6)), parseFloat(acceleration.z.toFixed(6)), acceleration.timestamp);
            this.travel.frames.push(new FrameRecord(new Date().getTime(),  [this.accelerometerData, this.gyroscopeData, this.magnetomererData]));
    });
  }

  watchGyroscope(intervalTime: number) {
    this.gyroscopeSub = this.gyroscope.watch({frequency: intervalTime})
      .subscribe((orientation: GyroscopeOrientation) => {
          this.gyroscopeData = new Sensor(-1, parseFloat(orientation.x.toFixed(6)), parseFloat(orientation.y.toFixed(6)), parseFloat(orientation.z.toFixed(6)), orientation.timestamp);
      });
  }

  watchMagnetometer(intervalTime: number) {
      this.magnetometerSub = this.deviceOrientation.watchReadings().subscribe(
          (magnetometer: MagnetometerReading) => {
              this.magnetomererData = new Sensor(magnetometer.magnitude, magnetometer.x, magnetometer.y, magnetometer.z, new Date().getTime());
          }
      );
  }

  unsubscribeMagnetometer() {
      console.log('stop magnetometer recording');
      this.magnetometerSub.unsubscribe();
  }

  unsubscribeAccelerometer() {
      console.log('stop acceleration recording');
    // this.accelerometerSub.clearWatch();
      this.accelerometerSub.unsubscribe();
  }


  unsubscribeGyroscope() {
      console.log('stop gyroscope recording');
      // this.gyroscopeSub.clearWatch();
      this.gyroscopeSub.unsubscribe();
  }
}

export {SensorsUtils};
