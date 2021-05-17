import mongoose from "mongoose"

const Schema = mongoose.Schema;
const ProductSchema = new Schema(
    {
        name: String,
        createdAt: Date,
        description: String,
        price: mongoose.Decimal128,
        // comments: [],
        category: String,
        // stars: mongoose.Decimal128
    }
);
ProductSchema.methods.stars = function () {
    return 0
}

export default mongoose.model("product", ProductSchema)