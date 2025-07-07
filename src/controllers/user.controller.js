import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken =  async (userId) => {
    try {
        // generate tokens
        const user = await User.findOne(userId)
        const refreshToken  = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        //refresh token to db
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        // having both tokens, ready to send via cookies
        return {accessToken, refreshToken}



    } catch (error) {
        throw new apiError(500, "Something went wrong while generating refresh and access token")
    }
}


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
    
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]    // we can simply put findOne(email) but here we need to check for both email and username, if anyone of them exists in db, then user exists and its reference we r storing in db
    })

    if(existingUser) {
        throw new apiError(409, "User already exists! ")
    }

    console.log(req.files);
    

    //multer middleware stores temporarily in local right, here we are getting the path through this
    const avatarLocalPath = req.files?.avatar[0]?.path

    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

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


const loginUser = asyncHandler( async (req, res) => {
    // req.body -> data
    // username or email based login
    //find the user
    //if not there, redirect to register
    // if there, check password
    //if match generate access and refresh token for user 
    // send these tokens secured cookies and send response for successful login

    const {email, username, password} = req.body
    // here we can login via any email or username
    if(!username && !email) {
        throw new apiError(400, "Username or Email is required")
    }

    // User.findOne({email}) // we use this simple syntax if we were to make login simply via one of the params
    //but we want ki either email or username, both works, if anyone of them is there in the database, then the user exists
    // therefore syntax for that
    const user = await User.findOne({
        $or: [{email, username}]
    })

    if(!user) {
        throw new apiError(404, "User doesnt exist")
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }

    //Cookie generation:
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    // this func did most of the thing, (refer .txt or its definition at the top)

    const loggedInUser = User.findById(user._id).select("-password refreshToken") // this is the instance we wil send to the user, with this will attach cookies

    const options = {
        httpOnly: "true",
        secure: "true"
    }
    
    // here we r sending tokens via cookies, but still sending a json response of loggedInUser, access and refresh tokens, this is for the case when the user wants to delibrately save his cookies in his local machine, its a good practice
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200, {
            user: loggedInUser, accessToken, refreshToken,
            
        },
        "User logged in successfully!"
    )
)

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: "true",
        secure: "true"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User Logged Out !"))


})






export {registerUser}
export {loginUser}
export {logoutUser}