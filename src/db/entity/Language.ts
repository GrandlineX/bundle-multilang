import { Column, CoreEntity, Entity } from '@grandlinex/core';

@Entity('Language')
export default class Language extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  label: string;

  constructor(props?: { code: string; label: string }) {
    super(props?.code);
    this.label = props?.label || '';
  }
}
