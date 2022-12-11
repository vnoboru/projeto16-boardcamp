import joi from "joi";

const customersSchema = joi.object({
  name: joi.string().min(3).required(),
  phone: joi.string().min(10).max(11).pattern(/^[0-9]+$/).required(),
  cpf: joi.string().length(11).pattern(/^[0-9]+$/).required(),
  birthday: joi.date().required(),
});

export default customersSchema;
