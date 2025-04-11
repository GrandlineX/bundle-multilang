import Translation from '../db/entity/Translation.js';

type TranslationType = Translation;
type LangData = {
  code: string;
  label: string;
  data: TranslationType[];
};
export { TranslationType, LangData };
