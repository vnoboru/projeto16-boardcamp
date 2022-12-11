import connection from "../db.js";
import customersSchema from "../schemas/customersSchema.js";

export async function postCustomersValidation(req, res, next) {
  const { name, phone, cpf, birthday } = req.body;

  const validation = customersSchema.validate(
    { name, phone, cpf, birthday },
    { abortEarly: false }
  );

  if (validation.error) {
    const err = validation.error.details.map((detail) => detail.message);
    return res.status(400).send(err);
  }

  try {
    const existCustomerCPF = await connection.query(
      `
      SELECT * 
      FROM customers
      WHERE cpf = $1
      `,
      [cpf]
    );

    if (existCustomerCPF.rows.length > 0) {
      return res.status(409).send("CPF já foi cadastrado.");
    }
  } catch (err) {
    res.status(500).send(err);
  }

  next();
}

export async function putCustomersValidation(req, res, next) {
  const { name, phone, cpf, birthday } = req.body;
  const { id } = req.params;

  const validation = customersSchema.validate(
    { name, phone, cpf, birthday },
    { abortEarly: false }
  );

  if (validation.error) {
    const err = validation.error.details.map((detail) => detail.message);
    return res.status(400).send(err);
  }
  
  next();
}
