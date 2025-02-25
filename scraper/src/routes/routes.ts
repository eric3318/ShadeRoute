import { Router } from 'express';
import { getData } from '../controllers/controllers';
const router = Router();

router.post('/', getData);

export default router;
