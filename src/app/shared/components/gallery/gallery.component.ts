import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {readdirSync} from 'fs';
import {ToastrService} from 'ngx-toastr';
import {join} from 'path';
import {forkJoin, Observable, of, Subscription} from 'rxjs';
import {catchError, defaultIfEmpty, filter, flatMap, map, tap} from 'rxjs/operators';
import {ImageModalComponent} from '../image-modal/image-modal.component';
import {Path} from '../../models/path';
import {Tag} from '../../models/tag';
import {TaggedMediumService} from '@app/core/services/tagged-medium.service';
import {TagService} from '@app/core/services/tag.service';
import {ElectronService} from '@app/core/services/electron.service';
import {ImageService} from '@app/core/services/image.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GalleryComponent implements OnInit, OnChanges {

  readonly AND = 1;
  readonly OR = 2;

  files: Path[] = [];
  tags: Tag[] = [];
  selectedPaths: Path[] = [];

  subscription: Subscription;
  condition: number = this.AND;

  page: number = 1;

  @Input()
  target: Path | Tag[];
  @ViewChild('galleryRoot', {static: true})
  root: ElementRef<HTMLDivElement>;

  get perPage(): number {
    const {offsetWidth, offsetHeight} = this.root.nativeElement;
    return Math.floor(offsetWidth / 170) * Math.floor(offsetHeight / 170);
  }

  get info(): string {
    if (this.target instanceof Path) {
      return join(this.target.ancestors, this.target.name);
    }

    if (this.target instanceof Array) {
      return `タグ： ${this.target.map(tag => tag.name).join(', ')}`;
    }

    return '';
  }

  get isMultiTagSearch(): boolean {
    return this.target instanceof Array && this.target.length > 1;
  }

  private get maxInRow(): number {
    return Math.floor(this.root.nativeElement.offsetWidth / 170);
  }

  private get maxRow(): number {
    return Math.floor(this.root.nativeElement.offsetHeight / 170);
  }

  private get maxInView(): number {
    return this.maxRow * this.maxInRow;
  }

  constructor(private modal: NgbModal, private electron: ElectronService, private tag: TagService,
              private taggedMedium: TaggedMediumService, private image: ImageService, private toast: ToastrService) {
  }

  ngOnInit(): void {
    this.tag.list().subscribe(tags => this.tags = tags);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {currentValue: target} = changes.target;
    if (!target) {
      return;
    }

    if (!!this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.page = 1;
    if (target instanceof Path) {
      this.loadImagesFromDirectory(target);
      return;
    }

    if (target instanceof Array) {
      this.loadImagesFromTag(target, this.condition);
    }
  }

  get thumbnails(): Path[] {
    if (this.files.length === 0) {
      return [];
    }

    const from = (this.page - 1) * this.perPage;
    const to = this.page * this.perPage;
    const files = this.files.slice(from, this.files.length < to ? this.files.length : to);

    if (files.length < this.maxInView) {
      for (let i = files.length; i < this.maxInView; i++) {
        files.push(null);
      }
    }

    return files;
  }

  openModal(path: Path, event: MouseEvent) {
    if (!path) {
      return;
    }

    if (event.ctrlKey) {
      this.resolveMultiSelectPath(path);
      return;
    }

    if (this.selectedPaths.length > 0) {
      this.selectedPaths = [];
      return;
    }

    const modalRef = this.modal.open(ImageModalComponent, {
      centered: true,
      size: 'xl',
      windowClass: 'view-image',
      keyboard: path.isImage,
    });
    const componentInstance = modalRef.componentInstance;
    componentInstance.src = join(path.ancestors, path.name);
    componentInstance.file = path;
    componentInstance.hasNext = this.hasNextThumbnail(componentInstance.src);
    componentInstance.hasBefore = this.hasBeforeThumbnail(componentInstance.src);

    componentInstance.next.subscribe(src => this.getNextThumbnail(componentInstance, src));
    componentInstance.before.subscribe(src => this.getBeforeThumbnail(componentInstance, src));
  }

  openContextMenu(path: Path) {
    if (!path) {
      return;
    }

    const {Menu, MenuItem, shell} = this.electron.remote;
    this.tag.list().subscribe(tags => {
      const contextMenu = Menu.buildFromTemplate([
        {label: 'ファイルの場所を開く', click: () => shell.showItemInFolder(join(path.ancestors, path.name))},
      ]);

      if (this.selectedPaths.length === 0) {
        contextMenu.append(new MenuItem({
          label: 'タグを追加',
          submenu: Tag.Group.all().map(group => ({
            label: group.name,
            submenu: tags.filter(tag => parseInt(tag.group.toString()) === group.code).map(tag => ({
              label: tag.name,
              click: () => this.setTag(path, tag),
            })),
          })),
        }));
      }

      if (this.target instanceof Path) {
        if (this.selectedPaths.length > 0) {
          contextMenu.append(new MenuItem({
            label: '選択中の画像にタグを一斉付与する',
            submenu: Tag.Group.all().map(group => ({
              label: group.name,
              submenu: tags.filter(tag => parseInt(tag.group.toString()) === group.code).map(tag => ({
                label: tag.name,
                click: () => {
                  this.selectedPaths.forEach(path => this.setTag(path, tag));
                  this.selectedPaths = [];
                },
              })),
            })),
          }));
        }
      }

      if (this.target instanceof Array && this.target.length === 1) {
        contextMenu.append(new MenuItem({type: 'separator'}));
        contextMenu.append(new MenuItem({
          label: '選択中のタグを削除する',
          click: () => this.removeTag(path),
        }));
      }
      contextMenu.popup();
    });
  }

  removeTag(path: Path) {
    this.taggedMedium.remove(path, this.target[0]).pipe(
      tap(() => alert('削除しました')),
    ).subscribe();
  }

  resolveMultiSelectPath(path: Path) {
    const idx = this.selectedPaths.findIndex(selected => selected.name === path.name && selected.ancestors === path.ancestors);
    if (idx !== -1) {
      this.selectedPaths.splice(idx, 1);
      return;
    }

    this.selectedPaths.push(path);
  }

  containsSelected(path: Path): boolean {
    if (!path) {
      return false;
    }
    return !!this.selectedPaths.find(selected => selected.name === path.name && selected.ancestors === path.ancestors);
  }

  private loadImagesFromDirectory(target: Path) {
    this.files = [];

    const ancestors = join(target.ancestors, target.name);
    const names = readdirSync(ancestors);

    const results = [];
    for (let name of names) {
      if (/^\./.test(name)) {
        continue;
      }

      const path = new Path(ancestors, name);
      if (!path.isImage && !path.isVideo) {
        continue;
      }
      results.push(path);
    }
    this.files = results;
  }

  private loadImagesFromTag(target: Tag[], condition: number) {
    const joins = forkJoin(target.map(tag => this.taggedMedium.search(tag)));
    let images: Observable<string[]>;
    if (condition === this.AND) {
      // console.log('and');
      images = joins.pipe(
        map(results => results.reduce((array, media) => {
          if (!array) {
            return media;
          }
          return array.filter(item => !!media.find(medium => item.image_id === medium.image_id));
        })),
        map(media => media.map(medium => medium.image_id)),
      );
    } else if (condition === this.OR) {
      // console.log('or');
      images = joins.pipe(
        map(results => results.flat(1)),
        map(media => media.map(medium => medium.image_id)),
        map(ids => Array.from(new Set(ids))),
      );
    }

    this.subscription = images.pipe(
      flatMap(ids => forkJoin(
        ids.map(id => this.image.get(id).pipe(catchError(() => of({}))))
      ).pipe(
        filter((obj: any) => Object.keys(obj).length !== 0),
      )),
      tap(i => console.log(i)),
      defaultIfEmpty([]),
      map(images => images.filter(image => Object.keys(image).length !== 0).map(image => Path.fromImage(image))),
    ).subscribe(files => this.files = files);
  }

  private hasNextThumbnail(src: string): boolean {
    const idx = this.thumbnails.findIndex(thumbnail => join(thumbnail.ancestors, thumbnail.name) === src);
    return !!this.thumbnails[idx + 1];
  }

  private hasBeforeThumbnail(src: string): boolean {
    const idx = this.thumbnails.findIndex(thumbnail => join(thumbnail.ancestors, thumbnail.name) === src);
    return idx > 0;
  }

  private getNextThumbnail(componentInstance: ImageModalComponent, src: string) {
    const idx = this.thumbnails.findIndex(thumbnail => join(thumbnail.ancestors, thumbnail.name) === src);
    const next = this.thumbnails[idx + 1];

    const newSrc = join(next.ancestors, next.name);
    componentInstance.src = newSrc;
    componentInstance.file = next;
    componentInstance.hasNext = this.hasNextThumbnail(newSrc);
    componentInstance.hasBefore = this.hasBeforeThumbnail(newSrc);
  }

  private getBeforeThumbnail(componentInstance: ImageModalComponent, src: string) {
    const idx = this.thumbnails.findIndex(thumbnail => join(thumbnail.ancestors, thumbnail.name) === src);
    const before = this.thumbnails[idx - 1];

    const newSrc = join(before.ancestors, before.name);
    componentInstance.src = newSrc;
    componentInstance.file = before;
    componentInstance.hasNext = this.hasNextThumbnail(newSrc);
    componentInstance.hasBefore = this.hasBeforeThumbnail(newSrc);
  }

  private setTag(path: Path, tag: Tag) {
    this.image.get(path).pipe(
      flatMap(image => {
        if (!!image) {
          return of(image);
        }
        return this.image.add(path);
      }),
      flatMap(image => forkJoin([of(image), this.taggedMedium.exists(image, tag)])),
    ).subscribe(([image, exists]) => {
      if (exists) {
        alert('指定画像には既に同じタグがつけられています');
        return;
      }

      this.taggedMedium.add(image, tag).subscribe(() => this.toast.success('追加しました'));
    });
  }
}
