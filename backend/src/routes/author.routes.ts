import { Router } from 'express';
import { getPublicAuthorBySlug } from '../controllers/author.controller';

const authorRouter = Router();

authorRouter.get('/:slug', getPublicAuthorBySlug);

export default authorRouter;
