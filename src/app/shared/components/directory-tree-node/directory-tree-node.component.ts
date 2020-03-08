import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faChevronRight, faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {basename, join} from 'path';
import {EMPTY, of} from 'rxjs';
import {catchError, flatMap, map} from 'rxjs/operators';
import {Path} from '../../models/path';
import {ElectronService} from '@app/core/services/electron.service';
import {LibraryService} from '@app/core/services/library.service';

@Component({
  selector: 'app-directory-tree-node',
  templateUrl: './directory-tree-node.component.html',
  styleUrls: ['./directory-tree-node.component.scss']
})
export class DirectoryTreeNodeComponent implements OnInit {

  readonly faChevronRight = faChevronRight;
  readonly faChevronDown = faChevronDown;

  @Input()
  path: Path;
  @Output()
  choiceDirectory = new EventEmitter<Path>(true);

  constructor(private electron: ElectronService, private library: LibraryService) {
  }

  ngOnInit() {
  }

  toggleDirectory(target: Path): void {
    if (!target.isDirectory) {
      return;
    }

    if (target.isTerminus) {
      this.choiceDirectory.emit(target);
      return;
    }

    if (target.isOpen) {
      this.closeDirectory(target);
      return;
    }

    this.openDirectory(target);
  }

  openContextMenu(path: Path) {
    const {Menu, shell, MenuItem} = this.electron.remote;
    const contextMenu = Menu.buildFromTemplate([
      {label: 'エクスプローラーで開く', click: () => shell.showItemInFolder(join(path.ancestors, path.name))},
    ]);

    if (this.path.isDirectory) {
      contextMenu.append(new MenuItem({type: 'separator'}));
      contextMenu.append(new MenuItem({label: '削除', click: () => this.removeLibrary()}));
    }

    contextMenu.popup();
  }

  private openDirectory(target: Path): void {
    target.open();
    target.children.sort(this.sortByName).sort(this.sortByStats);

    this.choiceDirectory.emit(target);
  }

  private closeDirectory(target: Path): void {
    target.close();
  }

  private sortByName(a: Path, b: Path): -1 | 0 | 1 {
    if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) {
      return -1;
    }

    if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) {
      return 1;
    }

    return 0;
  }

  private sortByStats(a: Path, b: Path): -1 | 0 | 1 {
    if (a.isTerminus && !b.isTerminus) {
      return 1;
    }

    if (!a.isTerminus && b.isTerminus) {
      return -1;
    }

    return 0;
  }

  private removeLibrary() {
    this.library.find(this.path).pipe(
      flatMap(library => {
        if (!library) {
          window.alert('指定のパスはライブラリに登録されていません。');
          return EMPTY;
        }
        return of(library);
      }),
      flatMap(library => {
        if (!window.confirm(`「${basename(library._id)}」をライブラリから削除します。よろしいですか？`)) {
          return EMPTY;
        }
        return of(library);
      }),
      map(library => this.library.remove(library)),
      catchError((err, caught) => {
        window.alert('ライブラリの削除に失敗しました。');
        console.error(err);
        console.error(caught);
        return EMPTY;
      }),
    ).subscribe();
  }
}
