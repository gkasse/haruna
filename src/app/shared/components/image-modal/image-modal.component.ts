import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faArrowAltCircleLeft, faArrowAltCircleRight} from '@fortawesome/free-regular-svg-icons';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ElectronService} from '@app/core/services/electron.service';
import {Path} from '../../models/path';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent implements OnInit {
  readonly faArrowAltCircleRight = faArrowAltCircleRight;
  readonly faArrowAltCircleLeft = faArrowAltCircleLeft;

  @Input()
  src: string;
  @Input()
  file: Path;
  @Input()
  hasNext: boolean;
  @Input()
  hasBefore: boolean;
  @Output()
  next = new EventEmitter<string>();
  @Output()
  before = new EventEmitter<string>();

  constructor(private electron: ElectronService, private ref: NgbActiveModal) {
  }

  ngOnInit() {
  }

  openNewWindow() {
    const {BrowserWindow} = this.electron.remote;
    const browser = new BrowserWindow({
      autoHideMenuBar: true,
    });
    browser.loadFile(this.src);
  }

  openContextMenu() {
    const {Menu, shell} = this.electron.remote;
    const contextMenu = Menu.buildFromTemplate([
      {label: '別窓で画像を開く', click: () => this.openNewWindow()},
      {label: 'ファイルの場所を開く', click: () => shell.showItemInFolder(this.src)},
      {type: 'separator'},
      {label: 'モーダルを閉じる', click: () => this.ref.close()},
    ]);
    contextMenu.popup();
  }
}
