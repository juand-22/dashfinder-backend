import { Router } from "express";
import { searchPlayer, getPlayersConnected, getInfoConnected, getPlayersWithStatus, getUserUuid, getModConfigured, getPlayer, disconetcMod, getPlayerServers, getInfoServer, getPlayerProfile } from "../controllers/minecraft.controller.js"
import { verifyUUID } from "../middlewares/verifyUUID.middleware.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";


const router = Router()

router.post("/search", verifyUUID, searchPlayer)
router.get("/connected", verifyToken, getPlayersConnected)
router.get("/info", verifyToken, getInfoConnected)
router.get("/players", verifyToken, getPlayersWithStatus)
router.get("/uuid", verifyToken, getUserUuid)
router.get("/configurated", verifyToken, getModConfigured)
router.get("/player", verifyToken, getPlayer)
router.post("/disconnect", verifyToken, disconetcMod)
router.get("/servers", verifyToken, getPlayerServers)
router.get("/server/:name", verifyToken, getInfoServer)
router.get("/profile", verifyToken, getPlayerProfile)

export default router