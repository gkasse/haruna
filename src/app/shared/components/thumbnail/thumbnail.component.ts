import {Component, Input, OnInit} from '@angular/core';
import {faVideo} from '@fortawesome/free-solid-svg-icons';
import {join} from 'path';
import {Path} from '../../models/path';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit {

  readonly video = faVideo;

  @Input()
  path: Path;

  constructor() {
  }

  get src(): string {
    return join(this.path.ancestors, this.path.name);
  }

  ngOnInit() {
  }
}
