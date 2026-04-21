import { sequelize } from "../config/databases.js";
import { DataTypes } from "sequelize";

const SearchLogs = sequelize.define("searchlogs", {
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    found: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    response: {
        type: DataTypes.JSON,
        allowNull: true,
    }

})

export default SearchLogs
