const {DataTypes} = require("sequelize");
const {sequelize} = require("../database/database");

const settings = sequelize.define(
    "Settings",
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true         
        },
        courtName:{
            type: DataTypes.STRING,
            allowNull:false,
            defaultValue: "Futsal Arena"
        },
        address:{
            type: DataTypes.STRING,
            allowNull:true,
        },
        facilities: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        courtRules: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        openingTime: {
            type: DataTypes.STRING,
            defaultValue: "06:00"
        },
        closingTime: {
            type: DataTypes.STRING,
            defaultValue: "23:00"
        }

    },
    {
        timestamps: true,
        tableName: "Settings"
    }
);

module.exports = settings;