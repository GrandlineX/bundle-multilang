import {
  Column,
  CoreEntity,
  Entity,
  EntityColumn,
  EProperties,
} from '@grandlinex/core';
import Language from './Language';

@Entity('Translation')
export default class Translation extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  key: string;

  @Column({
    dataType: 'string',
  })
  value: string;

  @EntityColumn(new Language())
  t_lang: string;

  constructor(props?: EProperties<Translation>) {
    super();
    this.key = props?.key || '';
    this.value = props?.value || '';
    this.t_lang = props?.t_lang || '';
  }
}
