import mongoose from mongoose

const medicalRcordSchema=new mongoose.Schema({},{timestamps:true})


export const MedicalRecord=mongoose.model("MedicalRecord",medicalRcordSchema)