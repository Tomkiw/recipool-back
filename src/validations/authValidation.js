import { Joi, Segments } from 'celebrate';

// Тіло позначене required(), інакше запит без body проходить валідацію
// і контролер падає на деструктуризації undefined (500 замість 400).
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().max(16).required(),
    email: Joi.string().email().max(128).required(),
    password: Joi.string().min(8).max(128).required(),
  }).required(),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().max(128).required(),
    password: Joi.string().min(8).max(128).required(),
  }).required(),
};
