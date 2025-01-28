import { Storage } from ".";
import path from 'node:path'
import fs from 'node:fs'
import { ScopedStorage } from "./sub";

export class FsStorage implements Storage {
  root: string

  constructor(root: string) {
    this.root = root
  }

  private filepath(name: string): string {
    return path.join(this.root, name);
  }

  from(path: string): Storage {
    return new ScopedStorage(this, path)
  }

  mkdir(path: string) {
    fs.mkdirSync(path);
  }

  exists(name: string): boolean {
    return fs.existsSync(this.filepath(name))
  }
  
  write(name: string, data: Uint8Array): void {
    fs.writeFileSync(this.filepath(name), data)
  }

  read(name: string): Uint8Array {
    return fs.readFileSync(this.filepath(name))
  }
}