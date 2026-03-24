import mongoose from "mongoose"


const ConnectDB=async()=>{
  // try {
    const connectRes=await mongoose.connect(`${process.env.MONGO_URL}`)
    console.log(`\nDB IS CONNECTED SUCCESSFULLY.... HOST IS--> ${connectRes.connection.host}`,)
  // } catch (error) {
  //   console.log("There is been While Connect to the DB: ",error);
  //   process.exit(1);
  // }
}

export default ConnectDB;