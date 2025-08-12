import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req,res) =>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.json({success : false,message:'Missing Details'});
    }

    try{

        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success: false, message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({name,email,password: hashedPassword});
        await user.save();

        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
        res.cookie('token',token, {
            httpOnly :true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Send verification email logic can be added here
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Verification Successful',
            text: 'Your account has been created successfully.'
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});

    }catch(error){
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

export const login = async (req,res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: 'Missing Details'});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'Invalid email'});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.json({success: false, message: 'Invalid password'});
        }

        const token = jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success: true});
    } catch (error) {
        return res.json({success: false, message: error.message});
        
    }
}

export const logout = async (req,res) =>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({success: true, message: 'Logged out successfully'});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// This function is used to send a verification OTP to the user's email
export const sendVerifyOTP = async (req, res) => {
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: 'Account already verified'});
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));
        user.verifyOTP = otp;
        
        let expiryTime = (Date.now() + 10 * 60 * 1000);
        user.verifyOTPExpireAt = expiryTime; // OTP valid for 10 minutes
        await user.save();
        

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            //text: `Your verification OTP is ${otp}. It is valid for 10 minutes.`
            html: EMAIL_VERIFY_TEMPLATE.replace('{{email}}', user.email).replace('{{otp}}', otp)
        }

        await transporter.sendMail(mailOptions);

        res.json({success: true, message: 'Verification OTP sent successfully'});

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

export const verifyEmail = async (req, res) =>{
    const {userId, otp} = req.body;
    
    if(!userId || !otp){
        return res.json({success: false, message: 'Missing Details'});
    }

    try {
        const user = await userModel.findById(userId);
        
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.isAccountVerified){
            return res.json({success: false, message: 'Account already verified'});
        }

        if(user.verifyOTP === '' || user.verifyOTP !== otp){
            return res.json({success: false, message: 'Invalid or expired OTP'});
        }

        if(user.verifyOTPExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        user.isAccountVerified = true;
        user.verifyOTP = '';
        user.verifyOTPExpireAt = 0;

        await user.save();

        return res.json({success: true, message: 'Account verified successfully'});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const isAuthenticated = async (req, res) => {

    try {

        res.json({success: true});
    } catch (error) {
        return res.json({success: false, message: error.message});
        
    }
}

//send password reset OTP

export const sendResetOTP = async (req, res) =>{
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message: 'Email required'});
    }
    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        const otp = String(Math.floor(Math.random() * 900000 + 100000));
        user.resetOTP = otp;
        user.resetOTPExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Reset OTP',
            //text: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`
            html: PASSWORD_RESET_TEMPLATE.replace('{{email}}', email).replace('{{otp}}', otp)
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true, message: 'Password reset OTP sent successfully'});

    } catch (error) {
        console.log(error);
        return res.json({success: false, message: error.message});
        
    }
}

//reset user password
export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: 'Missing Details'});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.resetOTP === '' || user.resetOTP != otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.resetOTPExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.resetOTP = '';
        user.resetOTPExpireAt = 0;

        await user.save();

        return res.json({success: true, message: 'Password reset successfully'});
    } catch (error) {
        return res.json({success: false, message: error.message});
        
    }
}

