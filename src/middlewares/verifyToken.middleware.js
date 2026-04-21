import jwt from "jsonwebtoken"
import { JWT_CONFIG } from "../config/jwt.config.js"
import User from "../models/Users.js"

export const verifyToken = async (req, res, next) => {
    try {
        const header = req.headers.authorization
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({error: "Token no proporcionado"})
        }

        const token = header.split(" ")[1]
        const payload = jwt.verify(token, JWT_CONFIG.secret)

        const existingUser = await User.findOne({
            where: {
                uuid: payload.uuid
            }
        })
        if (!existingUser) {
            return res.status(401).json({error: "Token inválido"})
        }


        req.user = payload

        next()
    } catch (error) {
        res.status(401).json({error: "Token inválido"})
    }
}
