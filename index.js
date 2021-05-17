import express from "express"
import {graphqlHTTP} from "express-graphql";
import schema from "./schema.js"
import mongoose from "mongoose"

// import Product from './model/product.js'

const app = express()

app.listen(3000, async () => {
    console.log("server is running ", 3000);
    await mongoose.connect("mongodb://localhost:27017/catalogue", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // let p1 = new Product({
    //     name: 'p1',
    //     createdAt: new Date(),
    //     description: 'p1 description',
    //     price: 49.99,
    //     // comments: [],
    //     category: 'c1',
    //     stars: 4.5
    // })
    // await p1.save()
});

mongoose.connection.on(
    "error",
    console.error.bind(console, "MongoDB connection error:")
);

app.use('/graphql', graphqlHTTP({schema, graphiql:true}))
