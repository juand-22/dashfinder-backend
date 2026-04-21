import User from "../models/Users.js"
import jwt from "jsonwebtoken"
import { JWT_CONFIG } from "../config/jwt.config.js"
import { randomUUID } from "crypto"


const randomToken = () => randomUUID()

export const createUser = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({error: "Faltan campos"})
        }

        if(username.length < 4) {
            return res.status(400).json({error: "Nombre de usuario demasiado corto"})
        }

        if(username.includes(" ")) {
            return res.status(400).json({error: "Nombre de usuario no puede contener espacios"})
        }
        
        if(username.length > 16) {
            return res.status(400).json({error: "Nombre de usuario demasiado largo"})
        }

        if(password.length > 30) {
            return res.status(400).json({error: "Contraseña demasiado largo"})
        }
        
        if(password.includes(" ")) {
            return res.status(400).json({error: "Contraseña no puede contener espacios"})
        }

        //letras raras o caracteres especiales
        if(!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({error: "Nombre de usuario solo puede contener letras, números y guiones bajos"})
        }
        //letras raras o caracteres especiales
        if(!/^[a-zA-Z0-9_]+$/.test(password)) {
            return res.status(400).json({error: "Contraseña solo puede contener letras, números y guiones bajos"})
        }

        const whitelistIp = ["45.224.21.68"]


        const ip = req.headers['x-real-ip'] || req.ip
        console.log("the ip: " + ip)

        if (!whitelistIp.includes(ip)) {
            const searchIp = await User.findAll({
                where: { IP: ip }
            })

            if (searchIp.length >= 3) {
                return res.status(400).json({ error: "Solo se permite registrar 3 usuarios por IP" })
            }
        }
        
        const existingUser = await User.findOne({
            where: {
                username,
            }
        })
        if(existingUser) {
            return res.status(400).json({error: "Nombre de usuario ya existe"})
        }

        

        const token = randomToken()

        const existingToken = await User.findOne({
            where: {
                uuid: token,
            }
        })

        if(existingToken) {
            token = randomToken()
        }

        

        const user = await User.create({
            username,
            password,
            uuid: token,
            IP: ip,
        })

        const payload = {
            id: user.id,
            username,
            uuid: token,
        }
        const jwttoken = jwt.sign(payload, JWT_CONFIG.secret, {
            expiresIn: JWT_CONFIG.expiresIn,
        })


        res.status(201).json({token: jwttoken, uuid: token})
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error al crear el usuario", error})
    }
}


export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({error: "Faltan campos"})
        }
        const user = await User.findOne({
            where: {
                username,
            }
        })
        if(!user) {
            return res.status(400).json({error: "Nombre de usuario o contraseña incorrectos"})
        }

        if (user.password && password !== user.password) {
            return res.status(400).json({error: "Nombre de usuario o contraseña incorrectos"})
        }

        const payload = {
            id: user.id,
            username,
            uuid: user.uuid,
        }

        const token = jwt.sign(payload, JWT_CONFIG.secret, {
            expiresIn: JWT_CONFIG.expiresIn,
        })
        res.status(200).json({token, uuid: user.uuid})
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error al iniciar sesión", error})
    }
}