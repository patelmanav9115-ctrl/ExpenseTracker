import express from 'express';
import { getGoals, addGoal, fundGoal, deleteGoal } from '../controllers/goalController.js';
import authMiddleware from '../middleware/auth.js';

const goalRouter = express.Router();
goalRouter.use(authMiddleware);

goalRouter.get('/', getGoals);
goalRouter.post('/', addGoal);
goalRouter.patch('/:id/fund', fundGoal);
goalRouter.delete('/:id', deleteGoal);

export default goalRouter;
