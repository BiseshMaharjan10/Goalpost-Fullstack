const {DataTypes} = require("sequelize");
const {sequelize} = require("../database/database");

const Activity = sequelize.define(
    "Activities",
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true         
        }, 
        action:{
            type: DataTypes.STRING,
            allowNull:false
        },
        bookingId:{
            type: DataTypes.INTEGER,
            allowNull:false
        },
        timestamp:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: false,
        tableName: "activities"
    }
)

module.exports = Activity;