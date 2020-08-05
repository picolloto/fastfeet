import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

// Importation from Controllers
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import DeliveriesController from './app/controllers/DeliveriesController';
import ProblemsController from './app/controllers/ProblemsController';

const routes = new Router();
const upload = multer(multerConfig);

// Route from Sessions
routes.post('/sessions', SessionController.store);

// Routes from Order to Deliverymans
routes.get('/delivery/:id/deliveries', DeliveriesController.index);
routes.put('/delivery/:id/orders/:order_id', DeliveriesController.update);

routes.post('/orders/:id/problems/', ProblemsController.index);

// Routes from files
routes.post('/files', upload.single('file'), FileController.store);

/**
 * Rotas para administradores autenticados na aplicação
 */

// Routes from Middleware
routes.use(authMiddleware);

// Routes from Recipients
routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

// Routes from Deliverymans
routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.get('/deliverymans', DeliverymanController.index);
routes.delete('/deliverymans/:id', DeliverymanController.delete);

// Routes from Orders
routes.post('/orders', OrderController.store);
routes.get('/orders/:id', OrderController.index);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

// Routes from Problems
routes.get('/delivery/:id/problems');

export default routes;
