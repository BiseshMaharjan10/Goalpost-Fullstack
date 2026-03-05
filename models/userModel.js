const {DataTypes} = require ("sequelize");
const {sequelize} = require ("../database/database");

const Register = sequelize.define(
    "Users",
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },

        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },

        email:{
            type: DataTypes.STRING,
            unique: true,
            allowNull: false

        },

        password:{
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM("user", "admin"),
            allowNull: false,
            defaultValue: "user",
        },

        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        profile:{
            type:DataTypes.STRING, // single image
            allowNull:true,
        },

        verificationToken: {
            type:DataTypes.STRING,
            allowNull:true
        },

        verificationTokenExpires:{
            type: DataTypes.DATE,
            allowNull:true
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordResetTokenExpires: {
            type: DataTypes.DATE,
        },

    },
    {
        timestamps: true,
        tableName: "users"
    }
);

module.exports = Register;