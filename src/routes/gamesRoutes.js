import { Router } from "express";
import { postGames, getGames } from "../controllers/gamesController.js";
import { postGamesValidation } from "../middlewares/gamesMiddleware.js";

const gamesRoutes = Router();

gamesRoutes.post("/games", postGamesValidation, postGames);
gamesRoutes.get("/games", getGames);

export default gamesRoutes;
