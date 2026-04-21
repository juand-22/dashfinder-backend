import User from "../models/Users.js";



export const verifyUUID = async (req, res, next) => {
    const { userUUID } = req.body
    if (!userUUID) {
        return res.json({ message: "No user received" })
    }

    const user = await User.findOne({
        where: {
            uuid: userUUID
        }
    })
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" })
    }
    if (!user.configurated) {
        return res.status(401).json({ error: "Mod no configurado" })
    }

    req.user = user
    next()
}