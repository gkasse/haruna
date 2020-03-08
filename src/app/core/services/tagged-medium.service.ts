import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {RepositoryService} from './repository.service';
import {TaggedMedium} from '@app/shared/models/tagged-medium';
import {Tag} from '@app/shared/models/tag';
import {Path} from '@app/shared/models/path';
import {Image} from '@app/shared/models/image';

@Injectable({
  providedIn: 'root'
})
export class TaggedMediumService extends RepositoryService<TaggedMedium> {

  constructor() {
    super('Tagged-medium');
  }

  search(tag: Tag): Observable<TaggedMedium[]> {
    const promise = this.db.find({
      selector: {
        'tag_id': {$eq: tag._id},
      },
    });

    return from(promise).pipe(
      map(<Tag>(res) => res.docs),
      map(docs => docs.map(docs => docs)),
    );
  }

  exists(image: Image, tag: Tag): Observable<boolean> {
    const promise = this.db.find({
      selector: {
        'image_id': {$eq: image._id},
        'tag_id': {$eq: tag._id},
      },
      limit: 1,
    });

    return from(promise).pipe(
      map(res => res.docs.length > 0),
    );
  }

  add(image: Image, tag: Tag): Observable<TaggedMedium> {
    const medium = new TaggedMedium();
    medium.tag_id = tag._id;
    medium.image_id = image._id;

    return from(this.db.put(medium)).pipe(
      map(() => medium),
    );
  }

  remove(path: Path, tag: Tag): Observable<any> {
    const promise = this.db.find({
      limit: 1,
      selector: {
        'tag.name': {$eq: tag.name},
        'path.name': {$eq: path.name},
        'path.ancestors': {$eq: path.ancestors},
      },
    });

    return from(promise).pipe(
      map(res => res.docs[0]),
      flatMap(doc =>  this.db.remove(doc)),
    );
  }
}
