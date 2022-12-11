import { Router } from "express";
import { postCustomersValidation, putCustomersValidation } from "../middlewares/customersMiddleware.js";
import { postCustomers, getCustomers, putCustomers, getCustomersSearch } from "../controllers/customersController.js";

const customersRoutes = Router();

customersRoutes.post("/customers", postCustomersValidation, postCustomers);
customersRoutes.get("/customers", getCustomers);
customersRoutes.get("/customers/:id", getCustomersSearch);
customersRoutes.put("/customers/:id", putCustomersValidation, putCustomers);

export default customersRoutes;
