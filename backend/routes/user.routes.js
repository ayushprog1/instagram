import express from "express";
import {editprofile, followorunfollow ,getSuggestedUser, getprofile, login, logout, register } from "../controller/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router =express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated,getprofile);
router.route('/profile/edit').post(isAuthenticated,upload.single('profilephoto'), editprofile);
router.route('/suggested').get(isAuthenticated, getSuggestedUser);
router.route('/followorunfollow/:id').post(isAuthenticated, followorunfollow);

export default router;

