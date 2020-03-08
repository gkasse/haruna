import { v4 as generateUUID } from 'uuid';

export class Tag {
  _id: string;
  name: string;
  group: Tag.Group;

  constructor(tag?: Tag) {
    if (!tag) {
      this._id = generateUUID();
      return;
    }
    this._id = tag._id;
    this.name = tag.name;
    this.group = tag.group;
  }
}

export namespace Tag {
  export enum Group {
    GENRE,
    PRODUCT,
    CREATOR,
    CHARACTER,
  }

  export namespace Group {
    export function all() {
      return [
        {code: Group.GENRE, name: 'ジャンル'},
        {code: Group.PRODUCT, name: '作品'},
        {code: Group.CREATOR, name: '作者'},
        {code: Group.CHARACTER, name: 'キャラクター'},
      ];
    }
  }
}
