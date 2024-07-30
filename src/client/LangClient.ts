import { CoreClient, ICoreKernel, ICoreKernelModule } from '@grandlinex/core';
import * as Path from 'path';
import * as fs from 'fs';
import { LangData } from '../lib/index.js';
import GLang from '../class/GLang.js';
import LangDb from '../db/LangDb.js';
import Language from '../db/entity/Language.js';
import Translation from '../db/entity/Translation.js';

export default class LangClient extends CoreClient<
  ICoreKernel<any>,
  LangDb,
  LangClient,
  null,
  null
> {
  static STORE_TRANSLATION_PATH = 'GLX_TRANSLATION_PATH';

  static DEFAULT_LANG_DB_KEY = 'lang';

  constructor(module: ICoreKernelModule<any, any, any, any, any>) {
    super('lang-client', module);
  }

  async hasLang(code: string): Promise<boolean> {
    return !!(await this.getModule().getDb().lang.getObjById(code));
  }

  async getLang(code: string): Promise<LangData | undefined> {
    const db = this.getModule().getDb();
    const lang = await db.lang.getObjById(code);
    if (!lang) {
      return undefined;
    }

    const d = await db.translations.getObjList({
      search: {
        t_lang: lang.e_id,
      },
    });
    const nlang: LangData = {
      label: lang.label,
      code: lang.e_id,
      data: d,
    };

    return nlang;
  }

  async getDefault(): Promise<LangData | undefined> {
    return this.getLang(await this.getDbLang());
  }

  async getCur(): Promise<LangData | null> {
    const db = this.getModule().getDb();
    if (await db.configExist(LangClient.DEFAULT_LANG_DB_KEY)) {
      const code = await db.getConfig(LangClient.DEFAULT_LANG_DB_KEY);
      if (code && (await this.hasLang(code.c_value))) {
        const lang = await this.getLang(code.c_value);
        if (lang) {
          return lang;
        }
      }
    }
    return (await this.getDefault()) || null;
  }

  async getCurTranslator(): Promise<GLang> {
    return new GLang(await this.getCur(), this);
  }

  async getLangList(): Promise<{ code: string; label: string }[]> {
    return (await this.getModule().getDb().lang.getObjList()).map(
      ({ e_id, label }) => ({
        code: e_id,
        label,
      }),
    );
  }

  async loadLangFromFolder(path: string) {
    const info = fs.statSync(path);
    const db = this.getModule().getDb();
    this.debug(path);
    if (info.isDirectory()) {
      const el = fs.readdirSync(path, {
        withFileTypes: true,
      });
      for (const item of el) {
        this.debug(item.name);
        if (item.isFile() && item.name.endsWith('.json')) {
          const file = item.name.split('.')[0];
          const name = file.split('-')[1];
          const code = file.split('-')[0];
          const langExist = await db.lang.getObjById(code);
          if (langExist) {
            this.log(`skip lang: ${code}-${name}`);
          } else {
            const lang = await db.lang.createObject(
              new Language({ code, label: name }),
            );
            const stream = fs.readFileSync(Path.join(path, item.name), {
              encoding: 'utf-8',
            });
            const json = JSON.parse(stream);
            const keys = Object.keys(json);
            for (const key of keys) {
              await db.translations.createObject(
                new Translation({
                  key,
                  value: json[key],
                  t_lang: lang.e_id,
                }),
              );
            }
            this.log(`load lang: ${code}-${name}`);
          }
        }
      }
    } else {
      this.error('Target is not a foulder');
      throw new Error('Target is not a foulder');
    }
  }

  async setDbLang(lang: string): Promise<void> {
    const db = this.getModule().getDb();
    if ((await this.hasLang(lang)) && db) {
      await db.setConfig(LangClient.DEFAULT_LANG_DB_KEY, lang);
    } else {
      throw this.lError('Lang not exist');
    }
  }

  async getDbLang(): Promise<string> {
    const db = this.getModule().getDb();

    if (await db?.configExist(LangClient.DEFAULT_LANG_DB_KEY)) {
      const code = await db?.getConfig(LangClient.DEFAULT_LANG_DB_KEY);
      if (code) {
        return code.c_value;
      }
    }
    return 'en';
  }
}
