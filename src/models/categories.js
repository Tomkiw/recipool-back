import { model, Schema } from 'mongoose';

const categoriesSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export const Categories = model('Categories', categoriesSchema);
