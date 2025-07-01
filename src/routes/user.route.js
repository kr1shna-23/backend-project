import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)  // this will give http://localhost8000/users/register
// router.route("/login").post(login)  //example if u wanna add more routes



export default router