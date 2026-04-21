import app from "./app.js"
import { sequelize, minecraft } from "./config/databases.js"
const port = 1980


async function main() {
    try {
        await sequelize.authenticate()
        await sequelize.sync({force: false})


        await minecraft.authenticate()
        await minecraft.sync({force: false})

        const query = await minecraft.query(`SELECT * FROM usuarios where name = :player`, {
            replacements: {
                player: "Elpibe071",
            },
            raw: true,
        })

        console.log("Database connected")


        console.log(query[0])



        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    } catch (error) {
        console.log("error al inciar el servidor", error)
    }
}

main()
