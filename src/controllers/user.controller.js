import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {fileUpload} from "../utils/fileUpload.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { deleteFile } from "../utils/deleteFile.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.GenerateAccessToken();
        const refreshToken = user.GenerateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error); // Log the error for debugging
        throw new ApiError(500, "Error generating tokens");
    }
};


const registerUser = asyncHandler(async (req, res, next) => {
    const { username, email, fullname, password } = req.body;

    if (!username || !email || !fullname || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (user) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImgLocalPath = req.files?.coverImg?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await fileUpload(avatarLocalPath);
    const coverImg = coverImgLocalPath ? await fileUpload(coverImgLocalPath) : null;

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const newUser = await User.create({
        username,
        email,
        password,
        fullname,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",
        refreshToken,
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User not registered");
    }

    return res.status(201).json(
        new ApiResponse(201, {createdUser,accessToken}, "User registered successfully")
    );
});



const loginUser = asyncHandler(async (req, res) => {
    console.log('Request Body:', req.body); // Log the request body for debugging

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Email or username is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(409, "No user found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(409, "Password is wrong");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully"));
});



const logOut = asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken : undefined,
        }
     },{
        new:true
     })

     const options = {
        httpOnly:true,
        secure:true
    }

    res.status(200)
    .clearCookie('accessToken',options)
    .clearCookie('refreshToken',options)
    .json(
        new ApiResponse(201,{},"User logged out")
    )
})


const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized access")
    }

    try {
        const decodedToken = await jwt.verify(incomingRefreshToken,REFRESH_TOKEN_SECRET)
    
        if(!decodedToken){
            throw new ApiError(401,"Unauthorized access")
        }
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401,"Unauthorized access")
    
        }
    
        const {accessToken , refreshToken} = GenerateRefreshToken(user._id)
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Unauthorized access")
    
        }
    
    
        return res.status(201).cookie("accessToken",accessToken).cookie("refreshToken",refreshToken).json(
            new ApiResponse(201,"Access Token Refreshed")
        )
    } catch (error) {
        throw new ApiError(409,{},"Error generating Access Token")
    }

})


const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword , newPassword } = req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(401,"both old and new password required")
    }

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(401,"old password is wrong")

    }

    user.password=newpassword;
    await user.save({validateBeforeSave:false})

    return res.status(201).json(
        new ApiError(201,{},"password has been changed successfully")
    )
})


const getCurrentUser = asyncHandler(async (req,res)=>{

    return res.status(201).json(
        new ApiResponse(201,req.user,"user found successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullname,email} = req.body

    const user =await User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullname,
            email,
        }
    },{new:true}).select("-password -refreshToken")

    return res.status(201).json(
        new ApiResponse(201,user,"account details have been updated")
    )
})

const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImgLocalPath = req.files?.coverImg?.path;
    if(!coverImgLocalPath){
        throw new ApiError(401,"no cover image found");
    }
    await deleteFile(coverImgLocalPath);
    const coverImg = await fileUpload(coverImgLocalPath)

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            coverImg:coverImg.url
        }},
        {new:true}
    ) 

    return res.status(201).json(
        new ApiResponse(201,user,"cover image has been updated")
    )
})

const updateAvatarImage = asyncHandler(async (req,res)=>{
    const avatarImgLocalPath = req.files?.avatarImg?.path;
    if(!avatarImg){
        throw new ApiError(401,"no avatar image found");
    }

    await deleteFile(avatarImgLocalPath);

    const avatarImg = await fileUpload(avatarImgLocalPath)

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatarImg:avatarImg.url
        }},
        {new:true}
    ) 
    return res.status(201).json(
        new ApiResponse(201,user,"Avatar image has been updated")
    )
})


const deleteUser = asyncHandler(async (req,res)=>{
    const user = await User.findByIdAndDelete(req.user._id,{lean:true})

    return res.status(201).json(
        new ApiResponse(201,user,"user removed successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {registerUser,loginUser,logOut,refreshAccessToken,updateAccountDetails,getCurrentUser,changeCurrentPassword,updateAvatarImage,updateCoverImage,deleteUser,getUserChannelProfile,getWatchHistory}