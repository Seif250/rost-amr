import { Router, IRouter } from 'express';
import {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';

const router: IRouter = Router();

router.route('/')
  .get(getAllMenuItems)
  .post(createMenuItem);

router.route('/:id')
  .get(getMenuItem)
  .put(updateMenuItem)
  .delete(deleteMenuItem);

export default router;
