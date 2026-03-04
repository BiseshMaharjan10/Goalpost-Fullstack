const RegisterUser = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt= require("jsonwebtoken")

const sendEmail = require("../helpers/sendEmail");

const registerUser = async(req, res) =>{
    try{
    const{username, email, password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message: "please fill the fields"
        })
    }
    
    const user = await RegisterUser.findOne({where:{username:username}})
    if(user){
        return res.status(400).json({
            message: `${username} already exists`
        })
    }

    // Check email duplicate 
    const userEmailExists = await RegisterUser.findOne({ where: { email } });
    if (userEmailExists) {
      return res.status(400).json({ message: `${email} already exists` });
    }

    // Validate email format  ← ADD HERE
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    //genereate verificTION TOKEN
    const verificationToken =  crypto.randomBytes(32).toString("hex")

    //verification token expire
    const verificationTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    
    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);


    //passing data to model
    const createUser = await RegisterUser.create({
        username,
        email,
        password:  hashedPassword,
        verificationToken,
        verificationTokenExpires
    });

    const verifyLink = `http://localhost:3000/api/user/verify-email?token=${verificationToken}`
   if (process.env.NODE_ENV !== "test") {
    await sendEmail(
        email,
        "Verify your email",
        `
        <p>click below to verify yourself</p>
        <a href=${verifyLink}> click here to verify</a>
        `
    );
}


    return res.status(201).json({
        success: true,
        message: "register successfully",
        user:{
            username: createUser.username,
            email: createUser.email
        }
    })
}catch(error){
    return res.status(404).json({
        success: false,
        message: "Error registering user ",
        error: error.message
    });

}
}

const loginUser = async(req,res) =>{
    try{

        if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "please fill the fields"
      });
    }
        const {email,password} = req.body
        const user = await RegisterUser.findOne({where:{email}})

        // Check if body is empty or missing fields

        if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "please fill the fields"
        });
        }


    // Validate email format
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
        }

        // Check if user exists
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        
        // checks password
        const isvalidUser = await bcrypt.compare(password,user.password)
        if(!isvalidUser){
            return res.status(400).json({
                message:"Invalid email or password"
            })
        }

        
        //generate JWT token
        const token = jwt.sign(
            {
                id: user.id, 
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        )

        return res.status(200).json({
            success: true,
            message:"Login successful", token
        })


    }catch(error){
        res.status(500).json({
            message:"Error logging user",
            error: error.message
        })
    }
} 

const getallUser = async (req,res) =>{
    try {  
        const user = await RegisterUser.findAll({  
            where: { role: "user" },
            attributes: { exclude: ["password"] }
        });
        res.json({
            success: true,
            user,
            message: "User Fetched Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error Fetching Users",
            error: error.message
        });
    }
}

const getMe = async(req,res) => {
    const id = req.user.id;
    try {
        const user = await RegisterUser.findByPk(id);
        return res.json({
            success : true,
            user: {
                id :user.id,
                username : user.username,
                email : user.email,
                profile: user.profile
            },
            message : "User Fetched Sucessfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : true,
            message : "Error Fetching User",
            error : error.message
        });
    }
}

const updateImage = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get the image path from uploaded file
        const profileImage = req.files?.profile
            ? `/uploads/${req.files.profile[0].filename}`
            : null;

        // Check if file was uploaded
        if (!profileImage) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        // Find the user
        const user = await RegisterUser.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update user's profile image
        user.profile = profileImage;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile: user.profile
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating profile image",
            error: error.message
        });
    }
};






module.exports = {
    registerUser,
    loginUser,
    getallUser,
    getMe,
    updateImage,
};