import connection from "../db.js";
import dayjs from "dayjs";

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
      INSERT INTO rentals ("customerId", "gameId", "rentDate","daysRented","returnDate", "originalPrice", "delayFee") 
      VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err);
  }
}
