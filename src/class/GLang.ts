import { CoreLogChannel } from '@grandlinex/core';
import { LangData } from '../lib';

export default class GLang {
  code: string;

  map: Map<string, string>;

  log?: CoreLogChannel;

  constructor(langDat: LangData | null, log?: CoreLogChannel) {
    this.log = log;
    this.code = '';
    this.map = new Map<string, string>();
    if (langDat) {
      this.loadLang(langDat);
    }
  }

  clear() {
    this.map.clear();
  }

  loadLang(lang: LangData): void {
    this.code = lang.code;
    lang.data.forEach(({ key, value }) => {
      this.map.set(key, value);
    });
  }

  get(key: string): string {
    return this.translate(key);
  }

  private translate(key: string): string {
    if (this.map.has(key)) {
      return this.map.get(key) || '';
    }

    if (this.log) {
      this.log.warn(`Missing translation: ${key}`);
    } else {
      console.warn(`Missing translation: ${key}`);
    }

    return key;
  }
}
