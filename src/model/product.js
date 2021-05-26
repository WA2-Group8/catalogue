import mongoose from "mongoose"
import Comment from "./comment.js"

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
            required: true
        },
        comments: [
            {
                //Comments are normalized inside Product
                type: Schema.Types.ObjectId,
                ref: "comment"
            }
            /*{
                title: {
                    type: String,
                    required: true
                },
                body: String,
                stars: {
                    type: Number,
                    required: true,
                    validate: {
                        validator: Number.isInteger,
                        message: "{VALUE} is not an integer value"
                    }
                },
                date: {
                    type: Date,
                    required: true,
                    default: Date.now
                }
            }
            */
        ],
        category: {
            type: String,
            enum: ['STYLE', 'FOOD', 'TECH', 'SPORT'],
            required: true
        }
    }
);

ProductSchema.methods.stars = function () {
    if(this.comments.length === 0)
        return 0
    let sum = this.comments.map(c => c.stars).reduce( (s1, s2) => s1+s2 , 0 );
    return sum/this.comments.length
}

export default mongoose.model("product", ProductSchema)
