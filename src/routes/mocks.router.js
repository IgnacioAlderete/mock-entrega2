import mocksControllers from "../controllers/mocks.controllers.js";
import { Router } from "express";

const router = Router();

router.get("/users", mocksControllers.getUsers);

router.post("/seed", mocksControllers.seedUsers);

export default router;