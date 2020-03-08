import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TagService} from '@app/core/services/tag.service';
import {Tag} from '../../models/tag';

@Component({
  selector: 'app-tag-create-modal',
  templateUrl: './tag-create-modal.component.html',
  styleUrls: ['./tag-create-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TagCreateModalComponent implements OnInit {

  readonly tagGroups = Tag.Group.all();
  tagCode: Tag.Group = Tag.Group.GENRE;
  tagName: string;

  constructor(public modal: NgbActiveModal, private tag: TagService) {
  }

  ngOnInit() {
  }

  create() {
    if (!this.tagName) {
      alert('名前は必ず入力してください');
      return;
    }

    const tag = new Tag();
    tag.group = this.tagCode;
    tag.name = this.tagName;
    this.tag.add(tag).subscribe(() => this.modal.close());
  }
}
