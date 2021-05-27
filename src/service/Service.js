"use strict";
import {to} from 'await-to-js'
import Product from '../model/product.js'
import Comment from '../model/comment.js'


//N.B. The graphiqlExamples.txt file contains some examples on how to use it (visit http://localhost:3000/graphql)


const getProducts = async function (args, context, info)
{
    //Extract the filterProductInputJSON (it's a JSON) from the request
    const filterProductInputJSON = args["filter"]

    //Creation of a filter parsing the request
    const filterJSON = createFilterJSON(filterProductInputJSON)
    //Creation of a storing criteria
    let sortJSON = {}
    if (args["sort"])
        sortJSON = { [args["sort"].value]: args["sort"].order }

    const products = await Product.find(filterJSON).sort(sortJSON)
    return products.populate("comments")
}

const createFilterJSON = function(data)
{
    if (data == null)
        return {}
    let query = {}
    if (data.categories)
        query.category = data.categories
    const minPrice = (data.minPrice) ? data.minPrice : 0
    const maxPrice = (data.maxPrice) ? data.maxPrice : Number.MAX_VALUE
    if (minPrice > maxPrice)
        throw "minPrice is greater than maxPrice"
    query.price = { $gte: minPrice, $lte: maxPrice }
    if(data.minStars)
        query.stars = { $gte: data.minStars }
    return query
}

const getProductById = async function(args)
{
    const id = args["id"]

    const [err, product] = await to(Product.findById(id).populate("comments"))
    if (err) throw(err)

    return product
}

const createProduct = async (args, context, info) =>
{
    const productJSON = args["productCreateInput"]

    const product = new Product({
        name: productJSON.name,
        createdAt: new Date(),
        description: productJSON.description,
        price: productJSON.price,
        comments: [],
        category: productJSON.category,
        stars: 0
    })

    return await product.save()
}

const createComment = async (args, context, info) =>
{
    //Extract the productId from the request
    const productId = args["productId"]

    //Look for the product having the wanted ID
    const product = await Product.findById(productId, (err, result) => {
        if (err) throw err
        return result
    });

    if (product == null)
        throw `There isn't any product having ID ${productId}`

    /* If you are here then the product was found in the database :) */

    //Extract the commentJSON (it's a JSON) from the request
    const commentJSON = args["commentCreateInput"]

    //Create a new comment
    const comment = new Comment({
        title: commentJSON.title,
        body: commentJSON.body,
        stars: commentJSON.stars,
        date: new Date()
    })

    //Compute the new product stars value
    const commentLength = product.comments.length
    const stars = ((commentLength * product.stars + comment.stars) / (commentLength + 1)).toFixed(1)

    //Add the new comment in the list of comments belonging to the product and then update the database
    product["comments"].push(comment)
    await Product.updateOne(
        { _id: productId },
        { comments: product["comments"] ,
                 stars: stars},
        (err) => {
            if (err) throw err;
        }
    )

    //Save the created comment in the database and retrieve it to the client
    return await comment.save()
}

const getComments = async (parent, args, context, info) =>
{
    let product = await Product.findById(parent.id,{  comments: { '$slice': -args.last }}).populate("comments")
    return product.comments
}

const Service = { getProducts, getProductById, createProduct, createComment, getComments }

export default Service
