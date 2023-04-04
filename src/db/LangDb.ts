import { CoreDBPrefab, CoreEntityWrapper, IDataBase } from '@grandlinex/core';
import Translation from './entity/Translation.js';
import Language from './entity/Language.js';

export default class LangDb extends CoreDBPrefab<any> {
  translations: CoreEntityWrapper<Translation>;

  lang: CoreEntityWrapper<Language>;

  constructor(db: IDataBase<any, any>) {
    super(db);
    this.lang = this.registerEntity(new Language());
    this.translations = this.registerEntity(new Translation());
  }

  initPrefabDB(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
