import { Joi, Segments } from 'celebrate';
// import { isValidObjectId } from 'mongoose';

export const getIngredientsSchema = {
  [Segments.QUERY]: Joi.object({
    name: Joi.string().min(3).optional(),
    desc: Joi.string().min(5).optional(),
    img: Joi.string(),
  }),
};
