import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {from} from 'rxjs';
import {map} from 'rxjs/operators';
import {ElectronService} from '@app/core/services/electron.service';
import {TagService} from '@app/core/services/tag.service';
import {Tag} from '../../models/tag';
import {TagUpdateModalComponent} from '../tag-update-modal/tag-update-modal.component';
import {TagCreateModalComponent} from '../tag-create-modal/tag-create-modal.component';

@Component({
  selector: 'app-tag-tree',
  templateUrl: './tag-tree.component.html',
  styleUrls: ['./tag-tree.component.scss']
})
export class TagTreeComponent implements OnInit {

  readonly faPlus = faPlus;

  tagGroups: {name: string, tags: Tag[], isOpen: boolean}[];
  selectTags: Tag[] = [];

  @Output()
  selected = new EventEmitter<Tag[]>();

  constructor(private fb: FormBuilder, private modal: NgbModal, private tag: TagService, private electron: ElectronService) {
  }

  ngOnInit() {
    this.loadTags();
  }

  openContextMenu(tag: Tag) {
    const {Menu} = this.electron.remote;
    const contextMenu = Menu.buildFromTemplate([
      {label: '更新', click: () => this.updateTag(tag)},
      {type: 'separator'},
      {label: '削除', click: () => this.removeTag(tag)},
    ]);
    contextMenu.popup();
  }

  toggleTag(tag: Tag, event: MouseEvent) {
    if (!event.ctrlKey) {
      this.selectTags = [tag];
      this.selected.emit(this.selectTags);
      return;
    }

    const idx = this.selectTags.findIndex(selected => selected._id === tag._id);
    if (idx >= 0) {
      this.selectTags.splice(idx, 1);
    } else {
      this.selectTags.push(tag);
    }

    this.selected.emit([...this.selectTags]);
  }

  addNewTag() {
    const promise = this.modal.open(TagCreateModalComponent, {
      windowClass: 'tag-create',
      centered: true,
    }).result;

    from(promise).subscribe(() => this.loadTags());
  }

  updateTag(tag: Tag) {
    const modalRef = this.modal.open(TagUpdateModalComponent, {
      windowClass: 'tag-update',
      centered: true,
    });
    modalRef.componentInstance.tagInput = tag;
    const promise = modalRef.result;

    from(promise).subscribe(() => this.loadTags());
  }

  removeTag(tag: Tag) {
    this.tag.remove(tag).subscribe(() => this.loadTags);
  }

  private loadTags() {
    this.tag.list().pipe(
      map(tags => Tag.Group.all().map(group => ({
        name: group.name,
        tags: tags.filter(tag => parseInt(tag.group.toString(10), 10) === group.code),
        isOpen: false,
      }))),
    ).subscribe(tags => this.tagGroups = tags);
  }
}
