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



const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email address"
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

        // Find user by email
        const user = await RegisterUser.findOne({ where: { email } });
        
        // Generic message for security - don't reveal if email exists
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link"
            });
        }

        // Generate reset token (plain token to send in URL)
        const resetToken = crypto.randomBytes(32).toString("hex");
        
        // Hash token before saving to database
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token and expiry (1 hour from now)
        user.passwordResetToken = hashedToken;
        user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        // Create reset URL with plain token
        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

        // Send email using your existing sendEmail helper
        if (process.env.NODE_ENV !== "test") {
            await sendEmail(
                email,
                "Password Reset Request - GoalPost",
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1f2937;">Password Reset Request</h2>
                    <p>Hello ${user.username},</p>
                    <p>You requested a password reset for your GoalPost account. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetURL}" 
                           style="background: linear-gradient(to right, #1f2937, #374151); 
                                  color: white; 
                                  padding: 12px 30px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  display: inline-block;
                                  font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #6b7280; word-break: break-all;">${resetURL}</p>
                    <p style="color: #ef4444; font-weight: bold;">This link will expire in 1 hour.</p>
                    <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                    <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        The GoalPost Team
                    </p>
                </div>
                `
            );
        }

        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error sending password reset email",
            error: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // Validate input
        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both password and confirm password"
            });
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Hash the token from URL to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const { Op } = require('sequelize');
        const user = await RegisterUser.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpires: {
                    [Op.gt]: new Date() // token not expired
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token fields
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful. You can now log in with your new password."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error resetting password",
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
    forgotPassword,
    resetPassword
};