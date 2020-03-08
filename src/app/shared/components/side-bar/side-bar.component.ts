import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Path} from '../../models/path';
import {Tag} from '../../models/tag';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SideBarComponent implements OnInit {

  @Output()
  change = new EventEmitter<Path | Tag[]>();

  constructor() {
  }

  ngOnInit() {
  }
}
