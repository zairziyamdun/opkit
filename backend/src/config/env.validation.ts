import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  readonly DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  readonly REDIS_URL: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  readonly PORT: number;

  @IsString()
  @IsNotEmpty()
  readonly FRONTEND_URL: string;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return validatedConfig;
}
