import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new mongoose.Schema({
    videoFile:{
        type:String, // cloudinary url
        required:true,
        unique:true,
    },
    thumbnail:{
        type:String, // cloudinary url
        required:true,
        unique:true,
    },
    title:{
        type:String,
        required:true,
        trim:true,
    },
    discription:{
        type:String, 
        required:true,
        unique:true,
    },
    duration:{
        type:Number, // cloudinary url
        required:true,
    },
    owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
            required:true
        },
    views:{
        type:Number,
        default:0,
        required:true
    },
    isPublished:{
        type:Boolean,
        required:true
    }
},{
    timestamps:true,
})

mongoose.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video",VideoSchema)