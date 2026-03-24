import mongoose from mongoose

const DoctorSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
    salary:{
    type:Number,
    required:true
  },
    qualification:{
    type:String,
    required:true
  },
    expInYears:{
    type:Number,
    default:0,
    required:true
  },
    name:{
    type:String,
    required:true
  },
    workInHospitals:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Hospital"
  }],
},{timestamps:true})


export const Doctor=mongoose.model("Doctor",DoctorSchema)