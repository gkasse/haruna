import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {map} from 'rxjs/operators';
import {Path} from '../../models/path';
import {ElectronService} from '@app/core/services/electron.service';
import {LibraryService} from '@app/core/services/library.service';
import BrowserWindow = Electron.BrowserWindow;

@Component({
  selector: 'app-directory-tree',
  templateUrl: './directory-tree.component.html',
  styleUrls: ['./directory-tree.component.scss']
})
export class DirectoryTreeComponent implements OnInit {

  paths: Path[];

  @Output()
  selected = new EventEmitter<Path>(true);

  constructor(private electron: ElectronService, private library: LibraryService) {
  }

  ngOnInit(): void {
    this.loadLibrary();
  }

  addLibrary(browserWindow: BrowserWindow) {
    const {dialog} = this.electron.remote;
    const [directory] = dialog.showOpenDialogSync(browserWindow, {
      properties: ['openDirectory', 'showHiddenFiles'],
    });
    this.library.add({_id: directory}).subscribe(() => this.loadLibrary());
  }

  openContextMenu(event: MouseEvent) {
    if (event.target instanceof HTMLSpanElement) {
      return;
    }

    const {Menu} = this.electron.remote;
    const contextMenu = Menu.buildFromTemplate([
      {label: 'ディレクトリを追加', click: (_, browserWindow) => this.addLibrary(browserWindow)},
    ]);
    contextMenu.popup();
  }

  private loadLibrary() {
    this.library.list().pipe(
      map(libraries => libraries.map(library => Path.fromLibrary(library))),
    ).subscribe(paths => this.paths = paths);
  }
}
