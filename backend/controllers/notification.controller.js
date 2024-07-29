import Notification from "../models/notificationModel.js";

export const getNotitfications = async (req, res) =>{
   try{
    const  userId = req.user._id;

    const notifications = await Notification.find({to: userId}).populate({
        path:"from",
        select:"username profileImg",
    });

    await Notification.updateMany({to: userId},{read:true})
    res.status(200).json(notifications)

   }
   catch(error){
    console.log("error in the getnotifications:", error.message);
    res.status(500).json("internel server error", error.message);
   }
}

export const deleteNotitfications = async (req, res) =>{
   try{
      const userId = req.user._id
      await Notification.deleteMany({to: userId});
      res.status(200).json({message: "Notification deleted successfully"})
   }
   catch(error){
    console.log("Error in the deleteNotifications function:", error.message);
    res.status(500).json({error:"internal server error"});
   }
}

export const notificationOneDelete = async (req,res) =>{
   try{
      const notitficationId = req.params.id;
      const userId = req.user._id;
      const notification = await Notification.findById(notitficationId);
    
      if(!notitficationId){
         return res.status(404).json({error: "Notification not found"});
      }
      if(notification.to.toString() !== userId.toString()){
        return res.status(404).json({error: "you are not allowed to delete this notification"});
      }
      
   }
   catch(error){
    console.log("error in the notificationsOnedelete:", error.message);
    res.status(500).json("internel server error", error.message);
   }
}