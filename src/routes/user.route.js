import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router()

// router.route("/register").post(registerUser)  // this will give http://localhost8000/users/register
// // router.route("/login").post(login)  //example if u wanna add more routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1

        }

    ]),
    registerUser)
    
    // this registerUser is controller, but just before that we are using middleware, thats the use of it (jaate hue mujse milke jana)


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router