import { Router } from "express";
import { postRentals, getRentals, deleteRentals } from "../controllers/rentalsController.js";
import { postRentalsValidation } from "../middlewares/rentalsMiddleware.js";

const rentalsRoutes = Router();

rentalsRoutes.post("/rentals", postRentalsValidation, postRentals);
rentalsRoutes.get("/rentals", getRentals);
rentalsRoutes.delete("/rentals/:id", deleteRentals);

export default rentalsRoutes;
