import connection from "../db.js";
import dayjs from "dayjs";
import pkg from "pg";

export async function postRentals(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = dayjs().format("YYYY-MM-DD");

  try {
    const pricePerDay = await connection.query(
      `
      SELECT "pricePerDay"
      FROM games
      WHERE id = $1
      `,
      [gameId]
    );    
    
    const pricePerDay1 = await connection.query(
      `
      SELECT *
      FROM games
      WHERE id = $1
      `,
      [gameId]
    );
    console.log(pricePerDay1.rows[0].id);

    await connection.query(
      `UPDATE games SET "stockTotal" = "stockTotal" - 1 WHERE id = $1`,
      [pricePerDay1.rows[0].id]
    );

    const originalPrice = daysRented * pricePerDay.rows[0].pricePerDay;

    await connection.query(
      `
      INSERT INTO 
        rentals (
          "customerId", 
          "gameId", 
          "rentDate",
          "daysRented",
          "returnDate", 
          "originalPrice", 
          "delayFee") 
      VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
}

export async function getRentals(req, res) {
  const { customerId, gameId } = req.query;

  pkg.types.setTypeParser(1082, function (birthday) {
    return String(birthday);
  });

  const code = `
  SELECT rentals.*, 
    games.id as "gameId", 
    games.name as "gameName", 
    games."categoryId" as "gameCategoryId", 
    customers.name as "customerName", 
    customers.id as "customerId", 
    categories.id as "categoryId", 
    categories.name as "categoryName" 
  FROM rentals
  JOIN games
  ON rentals."gameId" = games.id
  JOIN customers
  ON rentals."customerId" = customers.id
  JOIN categories
  ON games."categoryId" = categories.id
  `;

  try {
    let listRentals;
    if (!customerId && !gameId) {
      listRentals = await connection.query(code);
    } else if (customerId && !gameId) {
      listRentals = await connection.query(
        `
        ${code}
        WHERE rentals."customerId" = $1;
        `,
        [customerId]
      );
    } else if (!customerId && gameId) {
      listRentals = await connection.query(
        `
        ${code}
        WHERE rentals."gameId" = $1;
        `,
        [gameId]
      );
    }

    const rentals = listRentals.rows.map((r) => {
      return {
        id: r.id,
        customerId: r.customerId,
        gameId: r.gameId,
        rentDate: r.rentDate,
        daysRented: r.daysRented,
        returnDate: r.returnDate,
        originalPrice: r.originalPrice,
        delayFee: r.delayFee,
        game: {
          id: r.gameId,
          name: r.gameName,
          categoryId: r.categoryId,
          categoryName: r.categoryName,
        },
        customer: {
          id: r.customerId,
          name: r.customerName,
        },
      };
    });

    return res.send(rentals);
  } catch (err) {
    return res.status(500).send(err);
  }
}

export async function postFinishRentals(req, res) {
  const { id } = req.params;
  const today = dayjs().format("YYYY-MM-DD");
  const rental = await connection.query(
    `
    SELECT *
    FROM rentals
    WHERE id = $1
    `,
    [id]
  );

  const game = await connection.query(
    `
    SELECT * 
    FROM games
    WHERE id = $1
    `,
    [rental.rows[0].gameId]
  );

  try {
    let delay;
    const initialDay = new Date(rental.rows[0].rentDate).getTime();
    const todayDay = new Date(today).getTime();
    const millisecondsDay = 86400000;
    const rentalDay = rental.rows[0].daysRented;
    const gameDay = game.rows[0].pricePerDay;

    const daysPassed =
      Math.ceil((todayDay - initialDay) / millisecondsDay) - rentalDay;

    if (daysPassed <= 0) {
      delay = 0;
    } else {
      delay = daysPassed * gameDay;
    }

    await connection.query(
      'UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3',
      [today, delay, id]
    );

    await connection.query(
      `UPDATE games SET "stockTotal" = "stockTotal" + 1 WHERE id = $1`,
      [rental.rows[0].gameId]
    );

    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).send(err);
  }
}

export async function deleteRentals(req, res) {
  const { id } = req.params;

  try {
    await connection.query(
      `
      DELETE FROM rentals
      WHERE id = $1
      `,
      [id]
    );

    return res.status(200).send("Deletado com sucesso.");
  } catch (err) {
    return res.status(500).send(err);
  }
}
