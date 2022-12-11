import { Router } from "express";
import { getCategories, postCategories } from "../controllers/categoriesController.js";

const categoriesRoutes = Router();

categoriesRoutes.post("/categories", postCategories);
categoriesRoutes.get("/categories", getCategories);

export default categoriesRoutes;
