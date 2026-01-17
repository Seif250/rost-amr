import { Router, IRouter } from 'express';
import {
  getAllOrders,
  getOrder,
  getTodayOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';

const router: IRouter = Router();

router.route('/')
  .get(getAllOrders)
  .post(createOrder);

router.get('/today', getTodayOrders);

router.route('/:id')
  .get(getOrder)
  .put(updateOrder)
  .delete(deleteOrder);

router.patch('/:id/status', updateOrderStatus);

export default router;
