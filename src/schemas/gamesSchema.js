import joi from "joi";

const gamesSchema = joi.object({
  name: joi.string().min(3).required(),
  image: joi.string().uri().required(),
  stockTotal: joi.number().greater(0).required(),
  categoryId: joi.number().integer().required(),
  pricePerDay: joi.number().greater(0).required(),
});

export default gamesSchema;
