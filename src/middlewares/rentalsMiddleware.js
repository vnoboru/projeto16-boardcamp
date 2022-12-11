import rentalsSchema from "../schemas/rentalsValidation.js";
import connection from "../db.js";

export async function postRentalsValidation(req, res, next) {
  const { customerId, gameId, daysRented } = req.body;
  const validation = rentalsSchema.validate(
    { customerId, gameId, daysRented },
    { abortEarly: false }
  );

  if (validation.error) {
    const err = validation.error.details.map((detail) => detail.message);
    return res.status(400).send(err);
  }

  try {
    const verifyExistCostumer = await connection.query(
      `
    SELECT *
    FROM customers
    WHERE id = $1
    `,
      [customerId]
    );
    const veryfyExistGame = await connection.query(
      `
    SELECT *
    FROM games
    WHERE id = $1
    `,
      [gameId]
    );
    const veryfyAvailableGame = await connection.query(
      `
    SELECT "stockTotal"
    FROM games
    WHERE id = $1
    `,
      [gameId]
    );

    if (verifyExistCostumer.rows.length === 0) {
      return res.status(400).send("Cliente não existente.");
    }

    if (veryfyExistGame.rows.length === 0) {
      return res.status(400).send("Jogo não existente.");
    }

    if (veryfyAvailableGame.rows[0].stockTotal === 0) {
      return res.status(400).send("Jogo não está disponível no momento.");
    }
  } catch (err) {
    return res.status(500).send(err);
  }

  next();
}
