import pkg from "pg";
import connection from "../db.js";

export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    await connection.query(
      `
      INSERT INTO customers (name, phone, cpf, birthday)
      VALUES ($1, $2, $3, $4)
      `,
      [name, phone, cpf, birthday]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
}

export async function getCustomers(req, res) {
  const { cpf } = req.query;

  pkg.types.setTypeParser(1082, function (birthday) {
    return String(birthday);
  });

  try {
    if (cpf) {
      const listCustomersCPF = await connection.query(
        `
        SELECT *
        FROM customers
        WHERE customers.cpf
        LIKE $1
        `,
        [`%${cpf}%`]
      );

      return res.status(200).send(listCustomersCPF.rows);
    }

    const listCustomers = await connection.query(
      `
      SELECT * 
      FROM customers;
      `
    );

    return res.status(200).send(listCustomers.rows);
  } catch (err) {
    return res.status(500).send(err);
  }
}

export async function getCustomersSearch(req, res) {
  const { id } = req.params;

  try {
    let existCustomerId = await connection.query(
      `
      SELECT *
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (existCustomerId.rows.length === 0) {
      return res.status(404).send("Usuário não foi encontrado.");
    }

    res.status(200).send(existCustomerId.rows[0]);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function putCustomers(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;

  try {
    const existCpf = await connection.query(
      `
      SELECT * 
      FROM customers 
      WHERE cpf = $1 
      AND id <> $2
      `,
      [cpf, id]
    );
    if (existCpf.rows.length === 0) {
      await connection.query(
        `
      UPDATE customers 
      SET name = $1, phone = $2, cpf = $3, birthday = $4
      WHERE id = $5
      `,
        [name, phone, cpf, birthday, id]
      );

      return res.sendStatus(200);
    } else {
      return res.status(409).send("CPF já foi cadastrado.");
    }
  } catch (err) {
    return res.status(500).send(err);
  }
}
