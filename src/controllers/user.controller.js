import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    //get user data from frontend
    //validation - empty
    //check if user already exist (via username or email)
    //check for images, check for avatar
    //upload them to cloudinary, check if it successfully got uploaded to cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response that ur gonna send to frontend
    //check for user creation
    //return response

    const {fullName: fullName, email, username, password} = req.body
    console.log("email: ", email);

    // if(fullname === "") {
    //     throw new apiError(400, "Fullname is required")
    // }           //beginner way for validate

    if(
        [fullName, email, username, password].some((field) => 
        field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }
    
    const existingUser = User.findOne({
        $or: [{ username }, { email }]    // we can simply put findOne(email) but here we need to check for both email and username, if anyone of them exists in db, then user exists and its reference we r storing in db
    })

    if(existingUser) {
        throw new apiError(409, "User already exists! ")
    }

    //multer middleware stores temporarily in local right, here we are getting the path through this
    const avatarLocalPath = req.files?.avatar[0]?.path

    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new apiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    )

    if(!createdUser) {
        throw new apiError(500, "Something went wrong while resgistering user")
    }


    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully!")
    )



})

export {registerUser}