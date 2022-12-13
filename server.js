import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import categoriesRoutes from "./src/routes/categoriesRoutes.js";
import gamesRoutes from "./src/routes/gamesRoutes.js";
import customersRoutes from "./src/routes/customersRoutes.js";
import rentalsRoutes from "./src/routes/rentalsRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(categoriesRoutes);
app.use(gamesRoutes);
app.use(customersRoutes);
app.use(rentalsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running in port ${port}`));
