import { Router } from "express";
import { postRentals } from "../controllers/rentalsController.js";
import { postRentalsValidation } from "../middlewares/rentalsMiddleware.js";

const rentalsRoutes = Router();

rentalsRoutes.post("/rentals", postRentalsValidation, postRentals);
/*rentalsRoutes.get("/rentals", getRentals);*/

export default rentalsRoutes;
