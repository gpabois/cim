import { Storage } from ".";

export class ScopedStorage implements Storage {
  rootStorage: Storage;
  root: string;
  joiner: (lhs: string, rhs: string) => string;

  constructor(rootStorage: Storage, root: string, joiner?: ScopedStorage["joiner"]) {
    this.root = root;
    this.rootStorage = rootStorage;
    this.joiner = joiner || ((lhs, rhs) => ([lhs, rhs].join("/")));
  }
  
  private fullPath(pth: string): string {
    return this.joiner(this.root, pth)
  }

  mkdir(path: string) {
    this.rootStorage.mkdir(this.fullPath(path));
  }

  exists(path: string): boolean {
    return this.rootStorage.exists(this.fullPath(path));
  }
  
  write(path: string, data: Uint8Array): void {
    this.rootStorage.write(this.fullPath(path), data)
  }
  
  read(path: string): Uint8Array {
    return this.rootStorage.read(this.fullPath(path));
  }
  
  from(path: string): Storage {
    return new ScopedStorage(this.rootStorage, this.fullPath(path));
  }
}