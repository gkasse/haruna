import { Component, OnInit } from '@angular/core';
import { Path } from '../shared/models/path';
import { Tag } from '../shared/models/tag';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  files: Path[] = [];
  target: Path | Tag[];

  constructor() {
  }

  ngOnInit(): void {
  }
}
