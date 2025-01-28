import { isNone, isSome, None, Optional } from "../option";
import { Storage } from ".";
import { first } from "itertools";
import { ScopedStorage } from "./sub";

export type InMemoryNode = InMemoryFile | InMemoryDirectory

export interface InMemoryFile {
  kind: "file",
  name: string,
  data?: Uint8Array
}

export interface InMemoryDirectory {
  kind: "dir",
  name?: string,
  children: Array<InMemoryNode>
}

function isFileNode(node: InMemoryNode): node is InMemoryFile {
  return node.kind == "file"
}

function isDirNode(node: InMemoryNode): node is InMemoryDirectory {
  return node.kind == "dir"
}



class Path {
  _segments: Array<string>;
  
  private constructor(path: string) {
    this._segments = path.split("/").filter(isSome).map(s => s.trim()).filter(s => s.length > 0);
  }

  static assert(path: Path | string): Path {
    if(typeof path == "string") {
      return Path.fromString(path)
    } else {
      return path;
    }
  }

  static fromString(path: string): Path {
    return new Path(path)
  }

  static fromSegments(segments: Array<string>) {
    return new Path(segments.join("/"))
  }

  stem(): string {
    return this.segments().pop()!
  }
  
  parent(): Path {
    const segments = this.segments();
    segments.pop();
    return Path.fromSegments(segments)
  }

  segments(): Array<string> {
    return [...this._segments].filter(isSome)
  }

  toString(): string {
    return this._segments.join("/")
  }
}

export type Pathlike = Path | string;

/// Stockage persistent en mémoire
export class InMemory implements Storage {
  root: InMemoryDirectory
  
  constructor() {
    this.root = {kind: "dir", children: []}
  }

  private createFileNode(path: Pathlike) {
    const pth = Path.assert(path);
    const parentNode = this.parentNode(path);
    
    if(isNone(parentNode)) {
      throw `unexisting directory at ${path}`
    }

    if(isSome(parentNode) && isDirNode(parentNode)) {
      parentNode.children.push({
        kind: 'file',
        name: pth.stem()
      });
    } else {
      throw `not a directory at ${path}`;
    }
  }

  private createDirNode(path: Pathlike) {
    const pth = Path.assert(path);
    const parentNode = this.parentNode(path);
    
    if(isNone(parentNode)) {
      throw `unexisting directory at ${path}`
    }

    if(isSome(parentNode) && isDirNode(parentNode)) {
      parentNode.children.push({
        kind: 'dir',
        name: pth.stem(),
        children: []
      });
    } else {
      throw `not a directory at ${path}`;
    }
  }

  private parentNode(path: Pathlike): Optional<InMemoryNode> {
    const parentPath = Path.assert(path).parent();
    return this.node(parentPath)
  }

  private node(path: Pathlike): Optional<InMemoryNode> {
    const segments = Path.assert(path).segments();
    let node: Optional<InMemoryNode> = this.root;

    while (segments.length > 0 && isSome(node)) {
      const segment = segments.shift();

      if(isDirNode(node)) {
        node = first(node.children.filter(c => c.name == segment));
      } else {
        return None;
      }
    }

    return node
  }

  mkdir(path: string) {
    this.createDirNode(path)
  }

  from(path: string): Storage {
    return new ScopedStorage(this, path)
  }

  filepath(name: string): string {
    if(isSome(this.root)) {
      return `${this.root}/${name}`
    }

    return `/${name}`
  }

  exists(path: string): boolean {
    return isSome(this.node(path))
  }

  write(path: string, data: Uint8Array): void {
    let node = this.node(path);
    
    if(isNone(node)) {
      this.createFileNode(path);
      node = this.node(path);
    }

    if(isSome(node) && isFileNode(node)) {
      node.data = data;
    }
    else {
      throw `not a file at ${path}`
    }
  }
  
  read(path: string): Uint8Array {
    let node = this.node(path);
    if(isNone(node)) {
      throw `file not found at ${path}`
    }

    if(isSome(node) && isFileNode(node)) {
      return node.data!
    }

    throw `not a file at ${path}`
  }
}