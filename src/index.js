// import mongoose from mongoose;
import "./env.js"


import ConnectDB from "../db/index.js";
import { app } from "./app.js";



// console.log("process.env.PORT: ",process.env.PORT)
// console.log("process.env.CLOUDINARY_API_KEY: ",process.env.CLOUDINARY_API_KEY)

ConnectDB()
.then(()=>{
  app.listen(process.env.PORT || 6000,()=>{
    console.log(`Server is Running on the Port ${process.env.PORT}`)
  })
})
.catch((error)=>{
  console.log("There was some Error while connecting with DB: ",error);
})


/*(async()=>{
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`)
    app.on("error",(error)=>{
      console.log("ERROR ON: ",error)
      throw error
    })

    app.listen(process.env.PORT,()=>{
      console.log("Listining on the Port: ",process.env.PORT)
    })
  } catch (error) {
    console.log("ERROR: ",error);
    throw error
  }
})() */