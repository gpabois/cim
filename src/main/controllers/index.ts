import { ICimAPI } from "@shared/bridge";
import { EntityTypes } from "@shared/model";
import { Crud } from "@shared/types";

export abstract class BaseController<Prefix extends keyof ICimAPI> {
  private prefix: Prefix;
  private exposed: Record<string, any>

  constructor(prefix: Prefix, expose: Record<string, any>) {
    this.prefix = prefix;
    this.exposed = expose;
  }

  expose(exposed: ICimAPI[Prefix]) {
    this.exposed = {...this.exposed, ...exposed};
  }

  register(ipcMain: Electron.IpcMain) {
    Object.entries(this.exposed)
    .forEach(([name, handler]) => {
      ipcMain.handle(
        this.ipcEntryPoint(name), 
        (_event, ...args) => handler(...args)
      )
    })
  }

  ipcEntryPoint(name: string): string {
    return `cim.${this.prefix}.${name}`
  } 
}

export function exposeCrud<E extends EntityTypes>(entry: Crud<E>): Crud<E> {
  return {
    create: (...args) => entry.create(...args),
    update: (...args) => entry.update(...args),
    list: (...args) => entry.list(...args),
    get: (...args) => entry.get(...args)
  }
}