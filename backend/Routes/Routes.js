import { Router } from "express";
import UserRouter from '../UserController/routes/UserRoutes';
import ChatRouter from '../Chat/routes/chatRoutes'
import EventRouter from '../ActivityController/Routes/activityRoutes'
import AdminRouter from '../AdminController/routes/AdminRoutes'
import CmsRouter from '../CmsController/routes'

const router = Router();

router.use('/user',UserRouter)
router.use('/admin',AdminRouter)
router.use('/chat',ChatRouter)
router.use('/event',EventRouter)
router.use('/cms',CmsRouter)

export default router;
