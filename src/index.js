import express from "express"
import {graphqlHTTP} from "express-graphql"
import schema from "./schema.js"
import mongoose from "mongoose"

const app = express()

app.listen(3000, async () => {
    await mongoose.connect("mongodb://localhost:27017/catalogue", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("Server is running on port", 3000);
});

mongoose.connection.on(
    "error",
    console.error.bind(console, "MongoDB connection error:")
);

app.use('/graphql', graphqlHTTP({schema, graphiql:true}))
