import PouchDB from 'pouchdb';
import PouchDbFind from 'pouchdb-find';

export abstract class RepositoryService<T> {
  protected db: PouchDB.Database;

  protected constructor(dbName: string) {
    PouchDB.plugin(PouchDbFind);
    this.db = new PouchDB<T>(dbName);
  }
}
