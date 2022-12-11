import connection from "../db.js";

export async function postGames(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  try {
    await connection.query(
      `
      INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
      VALUES ($1, $2, $3, $4, $5);
      `,
      [name, image, stockTotal, categoryId, pricePerDay]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
}

export async function getGames(req, res) {
  const { name } = req.query;

  try {
    if (!name) {
      const listGames = await connection.query(
        `
        SELECT games.*, categories.name 
        AS "categoryName" 
        FROM games 
        JOIN categories
        ON games."categoryId" = categories.id;
        `
      );

      return res.status(200).send(listGames.rows);
    } else {
      const listGames = await connection.query(
        `
        SELECT games.*, categories.name 
        AS "categoryName" 
        FROM games 
        JOIN categories 
        ON games."categoryId" = categories.id 
        WHERE LOWER(games.name)
        LIKE $1;
        `,
        [`%${name.toLowerCase()}%`]
      );

      if (listGames.rowCount > 0) {
        return res.status(200).send(listGames.rows);
      } else {
        return res.status(200).send("Não foi possível encontrar o jogo.");
      }
    }
  } catch (err) {
    return res.status(500).send(err);
  }
}
