import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
    },
    avatar:{
        type:String, // cloudinary url
        required:true,
        unique:true,
    },
    coverImg:{
        type:String, // cloudinary url
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        require:[true,"Password is required"],
    },
    refreshToken:{
        type:String,
    }
},{
    timestamps:true,
})

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()

    this.password= await bcrypt.hash(this.password,10)
    next()
})

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

UserSchema.methods.GenerateAccessToken=function () {
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


UserSchema.methods.GenerateRefreshToken=function () {
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",UserSchema)