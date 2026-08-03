import { Router } from 'express';
import { listCategories } from '../controllers/category.controller';

/** Public category list — used by blog filters and admin blog form. */
const categoryRouter = Router();

categoryRouter.get('/', listCategories);

export default categoryRouter;
