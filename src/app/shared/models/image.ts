import {v4 as generateUUID} from 'uuid';

export class Image {
  _id: string;
  src: string;

  constructor() {
    this._id = generateUUID();
  }
}
