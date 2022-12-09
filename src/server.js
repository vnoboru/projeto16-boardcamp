import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const { Pool } = pkg;

const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/categories", async (req, res) => {
  const { name } = req.body;

  try {
    const existCategoryName = await connection.query(
      "SELECT * FROM categories WHERE name = $1",
      [name]
    );

    if (existCategoryName.rows.length > 0) {
      return res.status(409).send("Nome de categoria já existente.");
    }

    if (name === "") {
      return res.status(400).send("Não pode cadastrar um nome vazio.");
    }

    await connection.query("INSERT INTO categories (name) VALUES ($1)", [name]);

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/categories", async (req, res) => {
  const listGamesCategories = await connection.query(
    "SELECT * FROM categories"
  );

  return res.status(200).send(listGamesCategories.rows);
});

app.post("/games", async (req, res) => {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  try {
    const existGameName = await connection.query(
      "SELECT * FROM games WHERE name = $1",
      [name]
    );
    const existCategoryId = await connection.query(
      "SELECT * FROM categories WHERE id=$1",
      [categoryId]
    );

    if (name === "") {
      return res.status(400).send("Não pode cadastrar um nome vazio.");
    }

    if (stockTotal <= 0 || pricePerDay <= 0) {
      return res.status(400).send("Valor deve ser maior que zero.");
    }

    if (existCategoryId.rows.length === 0) {
      return res.status(400).send("O id digitado não existe em categorias.");
    }

    if (existGameName.rows.length > 0) {
      return res.status(409).send("Nome de jogo já existente.");
    }

    await connection.query(
      'INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5)',
      [name, image, stockTotal, categoryId, pricePerDay]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/games", async (req, res) => {
  const listGames = await connection.query(`SELECT * FROM games`);

  return res.status(200).send(listGames.rows);
});

const port = 4000;
app.listen(port, () => console.log(`Server running in port ${port}`));
