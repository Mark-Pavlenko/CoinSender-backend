import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value, { allowUnknown: true });
    if (error) {
      throw new BadRequestException(
        'Validation failed',
        error.details[0].message,
      );
    }
    return value;
  }
}
