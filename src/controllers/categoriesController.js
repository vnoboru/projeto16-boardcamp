import connection from "../db.js";

export async function postCategories(req, res) {
  const { name } = req.body;

  try {
    const existCategoryName = await connection.query(
      `
      SELECT * 
      FROM categories 
      WHERE name = $1;
      `,
      [name]
    );

    if (existCategoryName.rows.length > 0) {
      return res.status(409).send("Nome de categoria já existente.");
    }

    if (name === "") {
      return res.status(400).send("Não pode cadastrar um nome vazio.");
    }

    await connection.query(
      `
      INSERT INTO categories (name) 
      VALUES ($1);
      `,
      [name]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
}

export async function getCategories(req, res) {
  try {
    const listGamesCategories = await connection.query(
      `
    SELECT * 
    FROM categories;
    `
    );

    return res.status(200).send(listGamesCategories.rows);
  } catch (err) {
    return res.status(500).send(err);
  }
}
