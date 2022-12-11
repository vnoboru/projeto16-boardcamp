import connection from "../db.js";
import gamesSchema from "../schemas/gamesSchema.js";

export async function postGamesValidation(req, res, next) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  const validation = gamesSchema.validate(
    { name, image, stockTotal, categoryId, pricePerDay },
    { abortEarly: false }
  );

  if (validation.error) {
    const err = validation.error.details.map((detail) => detail.message);
    return res.status(400).send(err);
  }

  try {
    const existGameName = await connection.query(
      `
      SELECT * 
      FROM games 
      WHERE name = $1;
      `,
      [name]
    );
    const existCategoryId = await connection.query(
      `
      SELECT * 
      FROM categories 
      WHERE id = $1;
      `,
      [categoryId]
    );

    if (existCategoryId.rows.length === 0) {
      return res.status(400).send("O id digitado não existe em categorias.");
    }

    if (existGameName.rows.length > 0) {
      return res.status(409).send("Nome de jogo já existente.");
    }
  } catch (err) {
    res.status(500).send(err);
  }

  next();
}
