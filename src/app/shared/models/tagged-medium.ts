import {v4 as generateUUID} from 'uuid';

export class TaggedMedium {
  _id: string;
  tag_id: string;
  image_id: string;

  constructor() {
    this._id = generateUUID();
  }
}
