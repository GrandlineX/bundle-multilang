import { CMap, CoreLogChannel } from '@grandlinex/core';
import { LangData } from '../lib/index.js';

export default class GLang {
  code: string;

  map: Map<string, string>;

  missing: Set<string>;

  log?: CoreLogChannel;

  constructor(langDat: LangData | null, log?: CoreLogChannel) {
    this.log = log;
    this.code = '';
    this.map = new CMap<string, string>();
    this.missing = new Set<string>();
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

    this.missing.add(key);
    return key;
  }
}
