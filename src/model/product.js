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
            type: mongoose.Decimal128,
            required: true
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: "comment"
        }],
        category: {
            type: String,
            enum: ['STYLE', 'FOOD', 'TECH', 'SPORT'],
            required: true
        }
    }
);

ProductSchema.methods.stars = function () {
    let sum = this.comments.map(c => c.stars).reduce( (s1, s2) => s1+s2 , 0 );
    return sum/this.comments.length
}

export default mongoose.model("product", ProductSchema)
