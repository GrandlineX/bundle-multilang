import { CoreClient, ICoreKernel, ICoreKernelModule } from '@grandlinex/core';
import * as Path from 'path';
import * as fs from 'fs';
import { LangData } from '../lib';
import GLang from '../class/GLang';

export default class LangClient extends CoreClient<
  ICoreKernel<any>,
  null,
  LangClient,
  null,
  null
> {
  static STORE_TRANSLATION_PATH = 'GLX_TRANSLATION_PATH';

  static DEFAULT_LANG_DB_KEY = 'lang';

  langs: LangData[];

  path: string;

  constructor(
    module: ICoreKernelModule<any, any, any, any, any>,
    path: string
  ) {
    super('lang-client', module);
    this.langs = [];
    this.path = path;
  }

  hasLang(code: string): boolean {
    return !!this.langs.find((lang) => lang.code === code);
  }

  getLang(code: string): LangData | undefined {
    return this.langs.find((lang) => lang.code === code);
  }

  getDefault(): LangData | undefined {
    return this.langs[0];
  }

  async getCur(): Promise<LangData | null> {
    const db = this.getKernel().getDb();
    if (await db.configExist(LangClient.DEFAULT_LANG_DB_KEY)) {
      const code = await db.getConfig(LangClient.DEFAULT_LANG_DB_KEY);
      if (code && this.hasLang(code.c_value)) {
        const lang = this.getLang(code.c_value);
        if (lang) {
          return lang;
        }
      }
    }
    return this.getDefault() || null;
  }

  async getCurTranslator(): Promise<GLang> {
    return new GLang(await this.getCur(), this);
  }

  getLangList(): { code: string; label: string }[] {
    return this.langs.map(({ code, label }) => ({
      code,
      label,
    }));
  }

  async loadLangFromFolder() {
    const info = fs.statSync(this.path);
    this.debug(this.path);
    if (info.isDirectory()) {
      const el = fs.readdirSync(this.path, {
        withFileTypes: true,
      });
      for (const item of el) {
        this.debug(item.name);
        if (item.isFile() && item.name.endsWith('.json')) {
          const file = item.name.split('.')[0];
          const name = file.split('-')[1];
          const code = file.split('-')[0];
          const nlang: LangData = {
            label: name,
            code,
            data: [],
          };
          const stream = fs.readFileSync(Path.join(this.path, item.name), {
            encoding: 'utf-8',
          });
          const json = JSON.parse(stream);
          const keys = Object.keys(json);
          for (const key of keys) {
            nlang.data.push({
              key,
              value: json[key],
            });
          }
          this.langs.push(nlang);
          this.log(`load lang: ${nlang.code}-${nlang.label}`);
        }
      }
    } else {
      this.error('Target is not a foulder');
      throw new Error('Target is not a foulder');
    }
  }

  async setDbLang(lang: string): Promise<void> {
    const db = this.getKernel().getDb();
    if (this.hasLang(lang) && db) {
      await db.setConfig(LangClient.DEFAULT_LANG_DB_KEY, lang);
    } else {
      throw this.lError('Lang not exist');
    }
  }

  async getDbLang(): Promise<string | null> {
    const db = this.getKernel().getDb();

    if (await db?.configExist(LangClient.DEFAULT_LANG_DB_KEY)) {
      const code = await db?.getConfig(LangClient.DEFAULT_LANG_DB_KEY);
      if (code) {
        return code.c_value;
      }
    }
    return null;
  }
}
