import mongoose from "mongoose"

const Schema = mongoose.Schema;
const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        description: String,
        price: {
            type: Number,
            min: [0, 'Price must not be lower than 0'],
            required: true
        },
        comments: [
            {
                //Comments are normalized inside Product
                type: Schema.Types.ObjectId,
                ref: "comment"
            }
        ],
        category: {
            type: String,
            enum: ['STYLE', 'FOOD', 'TECH', 'SPORT'],
            required: true
        },
        stars: {
            type: Number
        }
    }
);

export default mongoose.model("product", ProductSchema)
