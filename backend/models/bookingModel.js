const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database");
const Register = require("./userModel"); 

const Booking = sequelize.define(
    "Booking", 
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true         
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Register,
                key: "id"
            }
        },
        customerName: {  
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        bookingDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        timeSlot: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            defaultValue: "pending"
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isWalkIn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        } 
    },
    {
        timestamps: true,
        tableName: "bookings"
    }
);

// Define associations
Register.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(Register, { foreignKey: "userId" });

module.exports = Booking;