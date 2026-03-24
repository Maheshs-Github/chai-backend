// import mongoose from mongoose;
import ConnectDB from "../db/index.js";
import { configDotenv } from "dotenv";
import { app } from "./app.js";


configDotenv();


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