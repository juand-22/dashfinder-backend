import { DataTypes } from "sequelize";
import { sequelize } from "../config/databases.js";

const Server = sequelize.define('server', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rank: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isHashed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  userUUID: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userUUID', 'username', 'ip_address']
    },

    { fields: ['userUUID'] },
    { fields: ['ip'] },
    { fields: ['ip_address'] },
    { fields: ['isHashed'] },
    { fields: ['username'] },  

    {
      fields: ['userUUID', 'ip']          
    },
    {
      fields: ['userUUID', 'ip_address']  
    },

    {
      fields: ['userUUID', 'ip_address', 'isHashed']
    },
    {
      fields: ['userUUID', 'ip', 'isHashed']
    },
    {
      fields: ['userUUID', 'ip_address', 'username']
    },
    {
      fields: ['userUUID', 'ip', 'username']
    }
  ]
});

export default Server;