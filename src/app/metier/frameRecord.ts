import {Sensor} from './sensor';

class FrameRecord {
  timestamp: number;
  sensors: Array<Sensor>;

  constructor(timestamp: number, sensors: Array<Sensor>) {
    this.sensors = sensors;
    this.timestamp = timestamp;
  }

}

export {FrameRecord};
