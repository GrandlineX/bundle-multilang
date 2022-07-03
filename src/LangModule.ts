import { CoreBundleModule, ICoreKernel } from '@grandlinex/core';
import LangClient from './client/LangClient';

export default class LangModule extends CoreBundleModule<
  ICoreKernel<any>,
  null,
  LangClient,
  null,
  null
> {
  defaultLang: string;

  constructor(kernel: ICoreKernel<any>, defaultLang: string) {
    super('lang', kernel);
    this.defaultLang = defaultLang;
  }

  async initModule(): Promise<void> {
    const store = this.getKernel().getConfigStore();
    const storePath = store.get(LangClient.STORE_TRANSLATION_PATH);
    if (!storePath) {
      throw this.lError('No Translation path defined');
    }
    const client = new LangClient(this, storePath);
    await client.loadLangFromFolder();
    this.setClient(client);
  }

  async startup(): Promise<void> {
    const client = this.getClient() as LangClient;
    if ((await client.getDbLang()) === null) {
      await client.setDbLang(this.defaultLang);
    }
  }

  initBundleModule(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
