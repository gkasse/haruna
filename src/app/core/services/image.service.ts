import {Injectable} from '@angular/core';
import {RepositoryService} from './repository.service';
import {Image} from '@app/shared/models/image';
import {Path} from '@app/shared/models/path';
import {join} from 'path';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService extends RepositoryService<Image> {

  constructor() {
    super('Image');
  }

  get(path: Path | string): Observable<Image> {
    if (path instanceof Path) {
      const promise = this.db.find({
        selector: {src: {$eq: join(path.ancestors, path.name)}},
        limit: 1,
      });

      return from(promise).pipe(
        map(<Image>(res) => res.docs[0]),
      );
    }

    return from(this.db.get(path)).pipe(
      map(<Image>(res) => res),
    );
  }

  add(path: Path): Observable<Image> {
    const image = new Image();
    image.src = join(path.ancestors, path.name);

    return from(this.db.put(image)).pipe(
      map(() => image),
    );
  }

  exists(path: Path): Observable<boolean> {
    const promise = this.db.find({
      selector: {src: {$eq: join(path.ancestors, path.name)}},
      limit: 1
    });

    return from(promise).pipe(
      map(<Image>(res) => res.docs.length > 0),
    );
  }
}
