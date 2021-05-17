import mongoose from "mongoose"

const Schema = mongoose.Schema;
const CommentSchema = new Schema(
    {
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
            default: Date.now
        }
    }
);

export default mongoose.model("comment", CommentSchema)