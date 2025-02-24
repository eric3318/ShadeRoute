import {Router} from "express";
import { initiateFetch } from "../controllers/controllers";
const router = Router();

router.post("/", initiateFetch);

export default router;