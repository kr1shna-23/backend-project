import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
// import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async (req, res, next) => {
    //possibility that req.cookies doesnt work? yes, in case of mobile app, we will have a custom header, hence we take care of that in the code
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token) {
            throw new apiError("401", "Unauthorized Request")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user) {
            throw new apiError(401, "Invalid Access Token")
        }
    
        req.user = user
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")
    }
})