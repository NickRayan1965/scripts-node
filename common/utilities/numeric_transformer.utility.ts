import { isEmpty } from 'class-validator';
import { ValueTransformer } from 'typeorm';

export const numericOrNullTransformer: ValueTransformer = {
  to: (value: number | null): string | null =>
    !isEmpty(value) ? value.toString() : null,
  from: (value: string | null): number | null =>
    !isEmpty(value) ? parseFloat(value) : null,
};

export const numericTransformer: ValueTransformer = {
  from: (value: string) => parseFloat(value),
  to: (value: number) => {
    return value.toString();
  },
};

