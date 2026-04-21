import express from "express"
import cors from "cors"
import appRoutes from "./routes/app.routes.js"
import minecraftRoutes from "./routes/minecraft.routes.js"
import authRoutes from "./routes/auth.routes.js"
import rateLimit from "express-rate-limit"


const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    keyGenerator: (req) => req.headers['x-real-ip'] || req.ip,
    message: { error: "Demasiadas peticiones." }
})


const app = express()



app.use(express.json())
app.use(cors({
    origin: "*"
}))



app.use(limiter)


app.use('/api', appRoutes)
app.use('/api/finder', minecraftRoutes)
app.use('/api/auth', authRoutes)

export default app