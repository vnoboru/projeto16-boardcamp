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
    const gameCategory = await connection.query(
      `INSERT INTO categories (name) VALUES ($1)`,
      [name]
    );

    return res.status(201).send(gameCategory);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/categories", async (req, res) => {
  const listGamesCategories = await connection.query(
    `SELECT * FROM categories`
  );

  return res.status(200).send(listGamesCategories.rows);
});

const port = 4000;
app.listen(port, () => console.log(`Server running in port ${port}`));
