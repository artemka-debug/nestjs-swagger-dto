import { ClassConstructor, classToPlain, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Result } from 'true-myth';

export function make<T>(cls: ClassConstructor<T>, object: T): T {
  return Object.assign(new cls(), object);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function input<T extends Record<string, any>>(
  cls: ClassConstructor<T>,
  object: unknown
): Promise<Result<T, string>> {
  const res = plainToClass(cls, object, { exposeUnsetFields: false });
  const errors = await validate(res, { whitelist: true, forbidNonWhitelisted: true });
  return errors.length === 0 ? Result.ok(res) : Result.err(getValidationError(errors[0]));
}

export function output<T>(instance: T): T {
  return classToPlain(instance, { strategy: 'excludeAll', excludeExtraneousValues: true }) as T;
}

function getValidationError(error: ValidationError): string {
  return error.constraints
    ? Object.values(error.constraints)[0]
    : getValidationError((error.children as ValidationError[])[0]);
}