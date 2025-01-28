import { ServiceTypes } from "@shared/model/services";
import { AiotTypes } from "../model/aiots";
import { ControleTypes } from "../model/controle";
import { OrganismeDeControleTypes } from "../model/organismes-de-controle";
import { isNone } from "../option";
import { Storage } from "../storage";
import { BaseCollection, Collection } from './collection';

export interface DatabaseArgs {
  rootStorage: Storage
}

export interface DatabaseCollections {
  "aiots": AiotTypes["fields"],
  "contrôles": ControleTypes["fields"],
  "services": ServiceTypes["fields"],
  "organismes-de-contrôle": OrganismeDeControleTypes["fields"]
}

export class Database {
  storage: Storage
  opened: Record<string, BaseCollection>;

  constructor(args: DatabaseArgs) {
    this.storage = args.rootStorage.from("data")
    this.opened = {}
  }

  /// Crée la base de donnée.
  static create(rootStorage: Storage) {
    rootStorage.mkdir("data");
    Database.initialise(rootStorage.from("data"))
    
  }
  /// Initialise la base de données.
  static initialise(storage: Storage) {
    Collection.initialise("aiots", storage);
    Collection.initialise("contrôles", storage);
    Collection.initialise("services", storage);
    Collection.initialise("organismes-de-contrôle", storage);
  }

  public flush() {
    Object.entries(this.opened).forEach(([_, col]) => col.flush());
  }

  public getCollection<Name extends keyof DatabaseCollections>(name: Name): Collection<DatabaseCollections[Name]> {
    if (isNone(this.opened[name])) {
      this.opened[name] = new Collection<DatabaseCollections[Name]>(name, this.storage);
    }

    return this.opened[name] as Collection<DatabaseCollections[Name]>;
  }
}
