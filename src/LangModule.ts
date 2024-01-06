import { CoreBundleModule, ICoreKernel, IDataBase } from '@grandlinex/core';
import LangClient from './client/LangClient.js';
import LangDb from './db/LangDb.js';

export default class LangModule extends CoreBundleModule<
  ICoreKernel<any>,
  LangDb,
  LangClient,
  null,
  null
> {
  defaultLang: string;

  constructor(
    kernel: ICoreKernel<any>,
    defaultLang: string,
    dbFc: (
      mod: CoreBundleModule<any, any, any, any, any>
    ) => IDataBase<any, any>
  ) {
    super('lang', kernel);
    this.defaultLang = defaultLang;
    this.setDb(new LangDb(dbFc(this)));
  }

  async initModule(): Promise<void> {
    const client = new LangClient(this);
    this.setClient(client);
  }

  async beforeServiceStart() {
    const store = this.getKernel().getConfigStore();
    const client = this.getClient();
    const isInit = await this.getDb().getConfig('init');
    if (!isInit) {
      const storePath = store.get(LangClient.STORE_TRANSLATION_PATH);
      if (!storePath) {
        throw this.lError('No Translation path defined');
      }
      await client.loadLangFromFolder(storePath);
      await client.setDbLang(this.defaultLang);
      await this.getDb().setConfig('init', 'true');
    }
    await this.getKernel().triggerFunction('lang-loaded');
  }

  initBundleModule(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
