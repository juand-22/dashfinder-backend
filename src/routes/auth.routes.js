import { Router } from "express";
import { createUser, loginUser } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router()

router.post('/create', createUser)
router.post('/login', loginUser)
router.get('/verify', verifyToken, (req, res) => {
    res.json({message: "Token válido"})
})

export default router