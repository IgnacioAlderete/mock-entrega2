import { Router } from 'express';
import usersController from '../controllers/users.controllers.js';
const router = Router();

router.get('/', usersController.findAll);
router.get('/:id', usersController.findById);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.delete);

export default router;