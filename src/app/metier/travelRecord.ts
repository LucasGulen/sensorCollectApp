import {Collection} from '@angular-devkit/schematics';
import {FrameRecord} from './frameRecord';
import {User} from './user';

class TravelRecord {
  id: string;
  // List of sensors recording frame in a travel
  frames: Array<FrameRecord> = new Array<FrameRecord>();

  // List of users implied in a carpooling travel
  travellers: Array<User> = new Array<User>();

  // Label of travel (if true, the travellers were together in the same vehicule)
  areTogether: boolean;

  timestampStart: number;
  timestampStop: number;

  constructor() {}

}

export {TravelRecord};
