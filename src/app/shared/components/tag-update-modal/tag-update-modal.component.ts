import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Tag} from '../../models/tag';
import {TagService} from '@app/core/services/tag.service';

@Component({
  selector: 'app-tag-update-modal',
  templateUrl: './tag-update-modal.component.html',
  styleUrls: ['./tag-update-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TagUpdateModalComponent implements OnInit {

  readonly tagGroups = Tag.Group.all();

  @Input()
  tagInput: Tag;

  constructor(public modal: NgbActiveModal, private tag: TagService) {
  }

  ngOnInit() {
  }

  update() {
    if (!this.tagInput.name) {
      alert('名前は必ず入力してください');
      return;
    }
    this.tag.update(this.tagInput).subscribe(() => this.modal.close());
  }

}
