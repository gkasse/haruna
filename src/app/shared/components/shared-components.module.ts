import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ThumbnailComponent} from './thumbnail/thumbnail.component';
import {DirectoryTreeComponent} from './directory-tree/directory-tree.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {DirectoryTreeNodeComponent} from './directory-tree-node/directory-tree-node.component';
import {LazyLoadImageModule} from 'ng-lazyload-image';
import {SideBarComponent} from './side-bar/side-bar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModalModule, NgbPaginationModule, NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import {GalleryComponent} from './gallery/gallery.component';
import {ImageModalComponent} from './image-modal/image-modal.component';
import { TagCreateModalComponent } from './tag-create-modal/tag-create-modal.component';
import { TagTreeComponent } from './tag-tree/tag-tree.component';
import { TagUpdateModalComponent } from './tag-update-modal/tag-update-modal.component';

@NgModule({
  declarations: [
    ThumbnailComponent,
    DirectoryTreeComponent,
    DirectoryTreeNodeComponent,
    SideBarComponent,
    GalleryComponent,
    ImageModalComponent,
    TagCreateModalComponent,
    TagTreeComponent,
    TagUpdateModalComponent,
  ],
  exports: [
    ThumbnailComponent,
    DirectoryTreeComponent,
    SideBarComponent,
    GalleryComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    LazyLoadImageModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTabsetModule,
    NgbPaginationModule,
    NgbModalModule,
  ],
  entryComponents: [
    ImageModalComponent,
    TagCreateModalComponent,
    TagUpdateModalComponent,
  ],
})
export class SharedComponentsModule {
}
