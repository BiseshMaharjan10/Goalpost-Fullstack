const express = require("express");
const {connect} = require("./routes/userRoute");
const app = express();
const { sequelize, connectDB } = require("./database/database")
const cors = require("cors")
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

//middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

//userRoutes and productRoutes
app.use("/api/user", require('./routes/userRoute'));
app.use("/api/booking", require('./routes/bookingRoute'));
app.use("/api/settings", require('./routes/settingsRoute'));

app.get("/",(req,res) =>{
    res.json({message: "Welcome to the Home Page"});
});

//start server
const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    await connectDB();
    await sequelize.sync({alter: true});
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();
