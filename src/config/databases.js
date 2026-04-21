
import { Sequelize } from "sequelize";

export const local = new Sequelize({
    dialect: "sqlite",
    storage: "./src/config/database.db",
    pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
    },
    logging: false 
})


export const sequelize = new Sequelize('pene', 'pene', 'pene', {
    host: '0.0.0.0',
    port: 3306,
    dialect: 'mariadb',
    pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
    },
    logging: false 
})

export const minecraft = new Sequelize({
    dialect: "sqlite",
    storage: "./src/config/mc_dbs.db",
    pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
    },
    logging: false
})