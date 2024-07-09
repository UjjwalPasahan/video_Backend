import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Uer"
    },
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Uer"
    }
},{
    timestamps:true,
})

export const Subscriber = mongoose.model("Subscriber",subscriptionSchema)