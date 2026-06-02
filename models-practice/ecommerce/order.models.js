import mongoose from mongoose

const orderItemSchema= new mongoose.Schema({
  productId:{
    type:mongoose.Schema.Types.ObjectId,
  ref:"Product"},
  quantity:{
    type:Number,
    default:0,
    required:true,
  }
})

// So we gave the refernce of thee Customer like which customer have perticular order , also here in the order , for orderItems we wanted the ProductId and the quantuty that is why we created the seperate schema and give in the type of orderItems , also we have set it as array of that scahema 

const orderSchema=new mongoose.Schema({
  orderPrice:{
    type:Number,
    required:true,
    default:0
  },
  customer:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  orderItems:{
    type:[orderItemSchema]
  },
  address:{
    type:String,
    required:true,
  },
  status:{
    type:String,
    enum:["PENDING","CANCELLED","DELIVERED"],
    default:"PENDING",
    required:true,
  }

},{timestamps:true})

export const Order=mongoose.model("Order",orderSchema)