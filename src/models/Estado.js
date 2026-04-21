import { sequelize } from "../config/databases.js";
import { DataTypes } from "sequelize";

const Estado = sequelize.define('estado', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    server: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    players: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    last_seen: {
        type: DataTypes.DATE,
        allowNull: false,
    }
})


export default Estado
