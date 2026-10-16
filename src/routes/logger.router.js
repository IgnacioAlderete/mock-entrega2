import { Router } from 'express';
import loggerControllers from '../controllers/logger.controllers.js';

const router = Router();

router.get('/', loggerControllers.test);

export default router;
