import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJwt = asyncHandler(async (req,res,next)=>{
    try {
        const cookie = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","")
        if (!cookie) {
            throw new ApiError(401,"Unauthorized Access")
        }
        const token = jwt.verify(cookie,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(token?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401,"Invalid Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(500,"something went wrong")
    }
})