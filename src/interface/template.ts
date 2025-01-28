import { Storage } from './storage';
import {createReport} from 'docx-templates';

export class Template {
  storage: Storage

  constructor(args: {rootStorage: Storage}) {
    this.storage = args.rootStorage.from("templates")
  }

  static create(rootStorage: Storage) {
    rootStorage.mkdir("templates")
  }

  public async generateFromName<T>(name: string, data: T): Promise<Uint8Array> {
    const bytes = this.storage.read(name);
    return await this.generateFromBuffer(bytes as any, data);
  }

  public async generateFromBuffer<T>(template: Buffer, data: T): Promise<Uint8Array> {
    console
    const document = await createReport({
      template,
      data,
      additionalJsContext: {
        newline: "\n",
        today: () => new Date().toLocaleDateString("fr-FR"),
        dénomination: (contact: any) => {
          if(contact?.genre === "homme") {
            return "Monsieur le Directeur"
          } else if(contact?.genre === "femme") {
            return "Madame la Directrice"
          } else {
            return "Madame, Monsieur le Directeur"
          }
        },
        join: (args: string[], ch: string) => args.join(ch)
      },
      cmdDelimiter: ['<', '>']
    });

    return document;
  }
}