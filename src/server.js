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
      `SELECT * FROM categories 
       WHERE name = $1;`,
      [name]
    );

    if (existCategoryName.rows.length > 0) {
      return res.status(409).send("Nome de categoria já existente.");
    }

    if (name === "") {
      return res.status(400).send("Não pode cadastrar um nome vazio.");
    }

    await connection.query(
      `INSERT INTO categories (name) 
       VALUES ($1);`,
      [name]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/categories", async (req, res) => {
  const listGamesCategories = await connection.query(
    `SELECT * FROM categories;`
  );

  return res.status(200).send(listGamesCategories.rows);
});

app.post("/games", async (req, res) => {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  try {
    const existGameName = await connection.query(
      `SELECT * FROM games 
       WHERE name = $1;`,
      [name]
    );
    const existCategoryId = await connection.query(
      `SELECT * FROM categories 
       WHERE id = $1;`,
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
      `INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
       VALUES ($1, $2, $3, $4, $5);`,
      [name, image, stockTotal, categoryId, pricePerDay]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/games", async (req, res) => {
  const { name } = req.query;
  try {
    if (!name) {
      const listGames = await connection.query(
        `SELECT games.*, categories.name 
         AS "categoryName" 
         FROM games 
         JOIN categories 
         ON games."categoryId" = categories.id;`
      );
      return res.status(200).send(listGames.rows);
    } else {
      const listGames = await connection.query(
        `SELECT games.*, categories.name 
         AS "categoryName" 
         FROM games 
         JOIN categories 
         ON games."categoryId" = categories.id 
         WHERE LOWER(games.name)
         LIKE $1;`,
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
});

app.post("/customers", async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const existCustomerCPF = await connection.query(
      `SELECT * FROM customers
       WHERE cpf = $1`,
      [cpf]
    );

    if (existCustomerCPF.rows.length > 0) {
      return res.status(409).send("CPF já foi cadastrado.");
    }

    if (name.length < 4) {
      return res.status(400).send("Precisa ter no mínimo 4 caracteres.");
    }

    if (name === "") {
      return res.status(400).send("Não pode cadastrar um nome vazio.");
    }

    if (phone.toString().length > 11 || phone.toString().length < 10) {
      return res
        .status(400)
        .send("O telefone deve conter entre 10 ~ 11 caracteres.");
    }

    if (cpf.toString().length > 11 || cpf.toString().length < 11) {
      return res.status(400).send("O cpf deve conter 11 caracteres.");
    }

    await connection.query(
      `INSERT INTO customers (name, phone, cpf, birthday)
       VALUES ($1, $2, $3, $4)`,
      [name, phone, cpf, birthday]
    );

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/customers", async (req, res) => {
  pkg.types.setTypeParser(1082, function (birthday) {
    return birthday;
  });

  const listCustomers = await connection.query(`SELECT * FROM customers;`);
  res.status(200).send(listCustomers.rows);
});

app.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;

  try {
    if (name.length < 4) {
      return res.status(400).send("Precisa ter no mínimo 4 caracteres.");
    }

    if (name === "") {
      return res.status(400).send("Não pode cadastrar um nome vazio.");
    }

    if (phone.toString().length > 11 || phone.toString().length < 10) {
      return res
        .status(400)
        .send("O telefone deve conter entre 10 ~ 11 caracteres.");
    }

    if (cpf.toString().length > 11 || cpf.toString().length < 11) {
      return res.status(400).send("O cpf deve conter 11 caracteres.");
    }

    await connection.query(
      `UPDATE customers 
      SET name = $1, phone = $2, cpf = $3, birthday = $4
      WHERE id = $5`,
      [name, phone, cpf, birthday, id]
    );

    res.sendStatus(200);
  } catch {}
});

const port = 4000;
app.listen(port, () => console.log(`Server running in port ${port}.`));
