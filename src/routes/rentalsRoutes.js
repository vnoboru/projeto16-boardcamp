import { Router } from "express";
import { postRentals, getRentals, deleteRentals, postFinishRentals } from "../controllers/rentalsController.js";
import { postRentalsValidation, rentalsDeleteValidation, rentalsReturnValidation } from "../middlewares/rentalsMiddleware.js";

const rentalsRoutes = Router();

rentalsRoutes.post("/rentals", postRentalsValidation, postRentals);
rentalsRoutes.get("/rentals", getRentals);
rentalsRoutes.post("/rentals/:id/return", rentalsReturnValidation, postFinishRentals);
rentalsRoutes.delete("/rentals/:id", rentalsDeleteValidation, deleteRentals);

export default rentalsRoutes;
