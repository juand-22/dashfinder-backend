import { Router } from "express";
import { minecraft } from "../config/databases.js";
import { recivePlayerData, configurationMod, clearConfiguration } from "../controllers/minecraft.controller.js";
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { verifyUUID } from "../middlewares/verifyUUID.middleware.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

router.post("/players", verifyUUID, recivePlayerData)
router.post('/verify', verifyUUID, (req, res) => {
    const uuid = req.user
    res.status(200).json({uuid})
})
router.post('/configuration', configurationMod)
router.post('/clear', clearConfiguration)
router.get('/mod/121-121x', (req, res) => {
    const filePath = path.join(__dirname, '../config/dash-1.21-1.21.x.jar')
    res.download(filePath, 'dash-1.21-1.21.x.jar') 
})
router.get('/mod/1205-1206x', (req, res) => {
    const filePath = path.join(__dirname, '../config/dash-1.20.5-1.20.6.jar')
    res.download(filePath, 'dash-1.20.5-1.20.6.jar') 
})
router.get('/mod/120-1204x', (req, res) => {
    const filePath = path.join(__dirname, '../config/dash-1.20-1.20.4.jar')
    res.download(filePath, 'dash-1.20-1.20.4.jar')
})

export default router