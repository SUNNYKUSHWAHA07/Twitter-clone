import express from "express";
import { protectedRoute } from "../middlewares/ProtectRoutes.js";
import { getNotitfications,deleteNotitfications,notificationOneDelete } from "../controllers/notification.controller.js";


 const router = express.Router(); 

 router.get("/", protectedRoute, getNotitfications);
 router.delete("/", protectedRoute, deleteNotitfications);
 router.delete("/:id", protectedRoute, notificationOneDelete);

 export default router