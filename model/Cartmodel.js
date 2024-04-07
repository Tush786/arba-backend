import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  orderItems: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: String, required: true },
      image: { type: String, required: true },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
