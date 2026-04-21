import { minecraft } from "../config/databases.js"
import Server  from "../models/Server.js"
import Estado from "../models/Estado.js"
import User from "../models/Users.js"
import { randomUUID } from "crypto"
import SearchLogs from "../models/searchLogs.js"

function isHashed(password) {
    if (!password) return false
    if (/^[a-f0-9]{32}$/i.test(password)) return true
    if (/^[a-f0-9]{40}$/i.test(password)) return true
    if (/^[a-f0-9]{56}$/i.test(password)) return true
    if (/^[a-f0-9]{64}$/i.test(password)) return true
    if (/^[a-f0-9]{96}$/i.test(password)) return true
    if (/^[a-f0-9]{128}$/i.test(password)) return true
    if (/^\$2[ab]\$/.test(password)) return true
    if (/^\$SHA\$/.test(password)) return true
    if (/^\$SHA512\$/.test(password)) return true
    if (/^SHA512\$/i.test(password)) return true
    if (/^SHA256\$/i.test(password)) return true
    if (/^[a-f0-9]+\$[a-f0-9]+$/i.test(password)) return true
    if (password.length > 20) return true
    return false
}

const randomToken = () => randomUUID()

export const searchPlayer = async (req, res) => {
    try {
        const { player } = req.body
        const result = await minecraft.query(`SELECT * FROM usuarios WHERE name = :player`, {
            replacements: { player },
            raw: true,
        })
        if (result[0].length === 0) {
            return res.status(404).json({ error: "Jugador no encontrado" })
        }
        res.status(200).json(result[0])
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al buscar el jugador" })
    }
}

const isValidNick = (nick) => /^[a-zA-Z0-9_]{1,16}$/.test(nick);

export const recivePlayerData = async (req, res) => {
    try {
        const { server, players } = req.body

        if (!players || players.length === 0) {
            return res.json({ message: "No players received" })
        }

        if (!server) {
            return res.json({ message: "No server received" })
        }

        const validPlayers = players.filter(p => p.nick && isValidNick(p.nick));

        if (validPlayers.length === 0) {
            return res.json({ message: "No valid players received" })
        }

        if (validPlayers.length > 1500) {
            return res.status(400).json({ error: "Solo puedes enviar hasta 1500 jugadores por request" })
        }

        const uuid = req.user.uuid
        const existUser = await User.findOne({ where: { uuid } })
        if (!existUser) {
            return res.status(404).json({ error: "Usuario no encontrado" })
        }

        const playerNicks = validPlayers.map(p => p.nick)

        const rankMap = {}
        for (const p of validPlayers) {
            if (p.rank) rankMap[p.nick] = p.rank
        }

        const existEstado = await Estado.findOne({ where: { uuid } })
        if (existEstado) {
            await existEstado.update({ uuid, server, players: playerNicks, last_seen: new Date() })
        } else {
            await Estado.create({ uuid, server, players: playerNicks, last_seen: new Date() })
        }

        const chunkSize = 50
        const chunks = []
        for (let i = 0; i < playerNicks.length; i += chunkSize) {
            chunks.push(playerNicks.slice(i, i + chunkSize))
        }

        const allResults = []
        for (const chunk of chunks) {
            const placeholders = chunk.map(() => '?').join(', ')
            const found = await minecraft.query(
                `SELECT * FROM usuarios WHERE name IN (${placeholders})`,
                { replacements: chunk, raw: true, type: minecraft.QueryTypes.SELECT }
            )
            allResults.push(...found)
        }

        const groupedByName = {}
        for (const user of allResults) {
            if (!groupedByName[user.name]) groupedByName[user.name] = []
            groupedByName[user.name].push(user)
        }

        const upsertPromises = Object.entries(groupedByName).map(async ([username, rows]) => {
            const unhashed = rows.find(u => u.password && !isHashed(u.password))
            const hashed   = rows.find(u => u.password && isHashed(u.password))

            let isHashedPassword
            if (unhashed)    isHashedPassword = false
            else if (hashed) isHashedPassword = true
            else             isHashedPassword = true

            await Server.upsert({
                username,
                name: server,
                ip: server,
                ip_address: server,
                isHashed: isHashedPassword,
                data: rows,
                rank: rankMap[username] || null,
                userUUID: uuid,
            })
        })

        await Promise.all(upsertPromises)

        const skipped = players.length - validPlayers.length;
        res.status(200).json({
            message: "Players data received successfully",
            ...(skipped > 0 && { skipped_invalid_nicks: skipped })
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al recibir los datos del jugador", detail: error.message })
    }
}

export const getPlayersConnected = async (req, res) => {
    try {
        const uuid = req.user.uuid
        const estado = await Estado.findOne({ where: { uuid } })
        if (!estado) return res.status(404).json({ error: "Jugador no encontrado" })
        res.status(200).json(estado.players)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener los jugadores conectados" })
    }
}

export const getInfoConnected = async (req, res) => {
    try {
        const uuid = req.user.uuid
        const estado = await Estado.findOne({ where: { uuid } })
        if (!estado) return res.status(404).json({ error: "Jugador no encontrado" })
        res.status(200).json(estado)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener la información conectada" })
    }
}

export const getPlayersWithStatus = async (req, res) => {
    try {
        const uuid = req.user.uuid
        const { filter = "all" } = req.query

        const estado = await Estado.findOne({ where: { uuid } })
        if (!estado) return res.status(404).json({ error: "No conectado" })

        console.log(estado.players)

        let playersInServer = estado.players

        let found = await Server.findAll({
            where: { userUUID: uuid, username: playersInServer }
        })

        const modConfigured = await User.findOne({ where: { uuid } })
        if (!modConfigured.configurated) {
            found = []
            playersInServer = []
        }

        const foundMap = {}
        for (const s of found) {
            foundMap[s.username] = s
        }

        const result = playersInServer.map(nick => {
            const serverEntry = foundMap[nick]

            if (!serverEntry) return {
                nick,
                status: "notfound",
                rank: null,
                hash: null,
                ip: null,
                isHashed: null,
                inServer: true
            }

            const data = serverEntry.data || []
            const hasUnhashed = data.some(r => r.password && !isHashed(r.password))

            return {
                nick,
                status: hasUnhashed ? "nohash" : "found",
                rank: serverEntry.rank || null, 
                isHashed: serverEntry.isHashed,
                ip: serverEntry.ip,
                ip_address: serverEntry.ip_address,
                data: serverEntry.data,
                inServer: true
            }
        })

        const filtered = result.filter(p => {
            if (filter === "all")      return true
            if (filter === "found")    return p.status === "found" || p.status === "nohash"
            if (filter === "nohash")   return p.status === "nohash"
            if (filter === "notfound") return p.status === "notfound"
            return true
        })

        res.status(200).json(filtered)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener jugadores" })
    }
}

export const getUserUuid = async (req, res) => {
    try {
        const uuid = req.user.uuid
        res.status(200).json({ uuid })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener el UUID" })
    }
}

export const configurationMod = async (req, res) => {
    try {
        const { uuid } = req.body
        const user = await User.findOne({ where: { uuid } })
        if (!user) return res.status(404).json({ error: "Jugador no encontrado" })
        user.configurated = true
        await user.save()
        res.status(200).json({ user: user.username })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al actualizar la configuración" })
    }
}

export const clearConfiguration = async (req, res) => {
    try {
        const { uuid } = req.body
        const user = await User.findOne({ where: { uuid } })
        if (!user) return res.status(404).json({ error: "Jugador no encontrado" })
        user.configurated = false
        await user.save()
        res.status(200).json({ user: user.username })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al borrar la configuración" })
    }
}

export const getModConfigured = async (req, res) => {
    try {
        const uuid = req.user.uuid
        const user = await User.findOne({ where: { uuid } })
        if (!user) return res.status(404).json({ error: "Jugador no encontrado" })
        res.status(200).json({ modConfigured: user.configurated })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener la configuración" })
    }
}



export const getPlayer = async (req, res) => {
    try {
        const { player } = req.query

        if (!player) return res.status(400).json({ error: "Jugador no especificado" })

        console.log(player)
        const query = await minecraft.query(`SELECT * FROM usuarios where name = :player`, {
            replacements: {
                player: player,
            },
            raw: true,
        })

        let found = false
        let response = []

        if (query[0]) {
            found = true
            response = query[0]
        }

        

        const createdLog = await SearchLogs.create({
            uuid: req.user.uuid,
            nickname: player,
            found: found,
            response
        })
        
        if (query[0]) {
            res.status(200).json(query[0])
        } else {
            res.status(404).json({ error: "Jugador no encontrado" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener el información del jugador" })
    }
}


export const disconetcMod = async (req, res) => {
    try {
        const id = req.user.id
        const user = await User.findOne({ where: { id } })
        if (!user) return res.status(404).json({ error: "Jugador no encontrado" })
        user.configurated = false
        user.uuid = randomUUID()
        await user.save()
        res.status(200).json({ user: user.username })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al actualizar la configuración" })
    }
}


export const getPlayerServers = async (req, res) => {
  try {
    const uuid = req.user.uuid;

    const servers = await Server.findAll({
      where: { userUUID: uuid },
      attributes: ["ip_address", "isHashed"]
    });

    if (servers.length === 0) {
      return res.status(404).json({ error: "Jugador no tiene servidores" });
    }

    const map = new Map();

    for (const server of servers) {

      if (!map.has(server.ip_address)) {
        map.set(server.ip_address, {
          ip: server.ip_address,
          players: 0,
          playersNotHashed: 0
        });
      }

      const entry = map.get(server.ip_address);

      entry.players += 1;

      if (!server.isHashed) {
        entry.playersNotHashed += 1;
      }
    }

    const dataToReturn = [...map.values()];

    res.json(dataToReturn);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los servidores" });
  }
};


export const getInfoServer = async (req, res) => {
  try {
    const uuid = req.user.uuid
    const ip = req.params.name

    const servers = await Server.findAll({
      where: { ip_address: ip, userUUID: uuid }
    })

    if (!servers.length) {
      return res.status(404).json({ error: "Servidor no encontrado" })
    }

    res.json(servers)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error al obtener información del servidor" })
  }
}

export const getPlayerProfile = async (req, res) => {
    try {
        const uuid = req.user.uuid
        const user = await User.findOne({ where: { uuid } })
        if (!user) return res.status(404).json({ error: "Jugador no encontrado" })
        res.status(200).json({ user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener el perfil" })
    }
}
