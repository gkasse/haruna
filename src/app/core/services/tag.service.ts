import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {RepositoryService} from './repository.service';
import {Tag} from '@app/shared/models/tag';

@Injectable({
  providedIn: 'root'
})
export class TagService extends RepositoryService<Tag> {

  constructor() {
    super('Tag');
  }

  list(): Observable<Tag[]> {
    return from(this.db.allDocs({include_docs: true})).pipe(
      map(<Tag>(res) => res.rows.map(row => new Tag(row.doc))),
    );
  }

  add(tag: Tag): Observable<Tag> {
    return from(this.db.put(tag)).pipe(
      map(() => tag),
    );
  }

  update(tag: Tag): Observable<boolean> {
    return from(this.db.get(tag._id)).pipe(
      flatMap(<Tag>(doc) => {
        doc.name = tag.name;
        doc.group = tag.group;
        return from(this.db.put(doc));
      }),
      map(res => res.ok),
    )
  }

  remove(tag: Tag): Observable<boolean> {
    return from(this.db.get(tag._id)).pipe(
      flatMap(doc => this.db.remove(doc)),
      map(<Tag>(res) => res.ok),
    );
  }
}
