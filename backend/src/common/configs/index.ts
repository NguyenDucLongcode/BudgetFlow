import registerAs from './configuration';
import { envValidationSchema } from './env.validation';
import { mailerConfig } from './mailer.config';
import { setupSwagger } from './swagger.config';
import { validationPipeConfig } from './validation.config';

export {
  registerAs as configuration,
  envValidationSchema,
  mailerConfig,
  setupSwagger,
  validationPipeConfig,
};
