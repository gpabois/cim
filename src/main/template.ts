import {createReport} from 'docx-templates';
import fs from 'node:fs/promises';
import path from 'node:path';

export class Template {
  root: string
  constructor(root: string) {
    this.root = root
  }

  public async generateFromName<T>(name: string, data: T): Promise<Uint8Array> {
    const template = await fs.readFile(path.join(this.root, "modèles", `${name}.docx`));
    return await this.generateFromBuffer(template, data);
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