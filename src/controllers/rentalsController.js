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
  pkg.types.setTypeParser(1082, function (birthday) {
    return String(birthday);
  });

  const listRentals = await connection.query(
    `
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
    `
  );

  if (listRentals.rows.length == 0) {
    res.status(404).send("no rentals information");
    return;
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

  res.status(200).send(rentals);
}
