const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "userarba",
  },
  orderItems: [
    {
			product: {
				type: Object,
				required: true,
			},
			quantity: { type: Number },
		},
  ],
});

const Cart_model = mongoose.model("cart", cartSchema);

module.exports = {
  Cart_model,
};
