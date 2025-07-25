import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        avatar: {
            type: String,
            required: true,
        },

        coverImage: {
            type: String,
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ], 

        password: {
            type: String,
            required: [true, "Password is required"]
        },

        refreshToken: {
            type: String
        }
    }, {
        timestamps: true
    }
)   

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();   //without this even when theres something else going on, it will keep on saving, hence only hash if changed
    this.password = await bcrypt.hash(this.password, 10)
    next() 

})

//custom method (created via mongoose) to check pass, returns true false its correct/incorrect
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//custom method to generate access token
userSchema.methods.generateAccessToken = function() {
    console.log("Access token expiry:", process.env.ACCESS_TOKEN_EXPIRY);

    return jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },

    process.env.ACCESS_TOKEN_SECRET,

    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

//custom method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
    {
        _id: this._id,
       
    },

    process.env.REFRESH_TOKEN_SECRET,
    
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User", userSchema)