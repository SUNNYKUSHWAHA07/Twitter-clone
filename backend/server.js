import path from "path";
import express, { urlencoded } from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.router.js"
import PostRouter from "./routes/post.route.js";
import notificationRouter from "./routes/notification.route.js"
import connectMongoDB from "./config/mongoose-config.js";
import {v2 as cloudinary} from "cloudinary"
import cookieParser from "cookie-parser";
const app = express();
app.use(urlencoded({ extended: true })); 



dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
const PORT = process.env.PORT || 5000;
const _dirname = path.resolve();

app.use(express.json({limit: "5mb"}));
app.use(cookieParser())

app.use('/api/auth', authRouter);
app.use('/api/users',userRouter);
app.use('/api/posts',PostRouter);
app.use('/api/notifications', notificationRouter);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(_dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
		res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
	});
}



app.listen(PORT, ()=>{
    console.log(`server is running ${PORT}`);
    connectMongoDB();
});
