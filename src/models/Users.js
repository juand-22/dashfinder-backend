import { DataTypes } from "sequelize";
import { sequelize } from "../config/databases.js"


const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    configurated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    IP: {
        type: DataTypes.STRING,
        allowNull: true,
    }
})

export default User