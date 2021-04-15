class Sensor {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  magnitude: number;

  constructor(magnitude: number, x: number, y: number, z: number, timestamp: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.timestamp = timestamp;
    this.magnitude = magnitude;
  }

}

export {Sensor};
