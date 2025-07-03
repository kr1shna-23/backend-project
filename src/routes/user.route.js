import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";

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
    registerUser) // this registerUser is controller, but just before that we are using middleware, thats the use of it (jaate hue mujse milke jana)


export default router