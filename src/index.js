import express from "express"
import {graphqlHTTP} from "express-graphql"
import schema from "./schema.js"
import mongoose from "mongoose"


// import Product from './model/product.js'
// import Comment from './model/comment.js'

const app = express()

app.listen(3000, async () => {
    await mongoose.connect("mongodb://localhost:27017/catalogue", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // let comment = new Comment({
    //         title: 'comment',
    //         body: 'test comment',
    //         stars: 3,
    //         date: new Date()
    //     })
    // let c = await comment.save()
    // let p1 = new Product({
    //     name: 'p1',
    //     createdAt: new Date(),
    //     description: 'p1 description',
    //     price: 49.99,
    //     comments: [c._id],
    //     category: 'FOOD',
    // })
    // await p1.save()
    // let res = await Product.find().populate("comments")
    // console.log(res)

    console.log("Server is running on port", 3000);
});

mongoose.connection.on(
    "error",
    console.error.bind(console, "MongoDB connection error:")
);

app.use('/graphql', graphqlHTTP({schema, graphiql:true}))
