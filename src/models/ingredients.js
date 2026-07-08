import { model, Schema } from 'mongoose';

const ingredientsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    img: {
      type: String,
      required: false,
      // default: 'sadsdsadasfasfdasfas'
    },
    _id: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

export const Ingredient = model('Ingredient', ingredientsSchema);
