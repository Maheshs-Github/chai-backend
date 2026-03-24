// Data Modeling Pacrice 
import mongoose from mongoose

const todoSchema=new mongoose.Schema({
  constent:{
    type:String,
    required:true
  },
  complete:{
    type:Boolean,
    default:false
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  subTodos:[{
    type:mongoose.Schema.Types.ObjectId.Boolean,
    ref:"SubTodo"
  }]
},{timestamps:true})



 export const Todo=mongoose.model("Todo",todoSchema)