import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RepositoryService} from './repository.service';
import {Library} from '@app/shared/models/library';
import {Path} from '@app/shared/models/path';
import {join} from 'path';

@Injectable({
  providedIn: 'root'
})
export class LibraryService extends RepositoryService<Library> {

  constructor() {
    super('Library');
  }

  list(): Observable<Library[]> {
    return from(this.db.allDocs<Library>({include_docs: true})).pipe(
      map(res => res.rows.map(row => row.doc)),
    );
  }

  add(library: Library): Observable<Library> {
    return from(this.db.put(library)).pipe(
      map(() => library),
    );
  }

  find(path: Path): Observable<Library> {
    return from(this.db.find({
      limit: 1,
      selector: {
        '_id': {$eq: join(path.ancestors, path.name)},
      },
    })).pipe(
      map((res: any) => res.docs[0] as Library)
    )
  }

  remove(library: Library): Observable<boolean> {
    return from(this.db.remove(library as any)).pipe(
      map(res => res.ok),
    );
  }
}
