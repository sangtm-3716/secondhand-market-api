import { ValueTransformer } from 'typeorm';

export const numericStringTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};
