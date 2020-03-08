import {basename, extname, join} from 'path';
import {readdirSync, statSync} from 'fs';
import {Library} from './library';
import {Image} from './image';

export class Path {
  name: string;
  isDirectory: boolean;

  children: Path[] = [];
  ancestors: string = '';
  isOpen: boolean = false;
  isPermitted: boolean = true;
  isTerminus: boolean = false;

  constructor(ancestors: string, name: string) {
    this.ancestors = ancestors;
    this.name = name;

    try {
      const stat = statSync(join(ancestors, name));
      this.isDirectory = stat.isDirectory();
    } catch (e) {
      this.isPermitted = false;
      return;
    }
  }

  get isImage(): boolean {
    switch (extname(this.name)) {
      case '.jpeg':
      case '.jpg':
      case '.png':
      case '.bmp':
      case '.gif':
        return true;

      default:
        return false;
    }
  }

  get isVideo(): boolean {
    switch(extname(this.name)) {
      case '.mp4':
      case '.webm':
        return true;
      default:
        return false;
    }
  }

  static fromLibrary(library: Library): Path {
    const name = basename(library._id);
    const ancestors = library._id.substr(0, library._id.indexOf(name));
    return new Path(ancestors, name);
  }

  static fromImage(image: Image): Path {
    const name = basename(image.src);
    const ancestors = image.src.substr(0, image.src.indexOf(name));
    return new Path(ancestors, name);
  }

  open() {
    const fullPath = join(this.ancestors, this.name);
    const children = readdirSync(fullPath).map(child => new Path(fullPath, child));
    for (let path of children) {
      if (!path.isDirectory) {
        continue;
      }

      try {
        const childPath = join(path.ancestors, path.name);
        const descendants = readdirSync(childPath);
        let isTerminus = true;
        for (let descendant of descendants) {
          try {
            const stat = statSync(join(childPath, descendant));
            if (stat.isDirectory()) {
              isTerminus = false;
              break;
            }
          } catch (e) {
            // noop
          }
        }
        path.isTerminus = isTerminus;
      } catch (e) {
        path.isPermitted = false;
      }
    }
    this.children = children.filter(path => path.isPermitted && path.isDirectory);
    this.isOpen = true;
  }

  close() {
    this.children = [];
    this.isOpen = false;
  }
}
