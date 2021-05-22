"use script";

import Product from '../model/product.js'
import Comment from '../model/comment.js'


/*
    (!!!) N.B.: il file graphqilExamples.txt contiene esempi di come utilizzare getProducts e createComment
    tramite il tool GraphiQL
 */


async function getProducts(args, context, info)
{
    // N.B.: Lory, siccome il collegamento tra Products e Comments nel DB e di tipo normalized,
    // interrogando il db potresti restituire al client solo l'id (il db contiene solo l'id).
    // Quindi, credo che tu debba anche interrogare il database per ottenere i commenti a partire dall'id prima di restituire
    // i risultati al client.
    // Una alternativa (da valutare) è quella di fare una relazione embedded

    //Extract the filterProductInputJSON (it's a JSON) from the request
    const filterProductInputJSON = args["filter"]

    //Creation of a filter parsing the request
    const filterJSON = createFilterJSON(filterProductInputJSON)
    //Creation of a storing criteria
    const sortJSON = { [args["sort"].value]: args["sort"].order }

    //Projection JSON for getting last N comments for each product
    //If client does not provide the param "last", all comments will be retrieved (in this case the projection is an empty JSON object)
    let lastComments = 1 //Questo parametro andrà preso dalla query grapql fatta dal client
    const projection = (lastComments > 0) ? {  comments: { '$slice': -lastComments }  } : { }

    let products = await Product.find(filterJSON,   projection  ).sort(sortJSON)

    //Filter products by stars after the query (it's not the best solution)
    if (filterProductInputJSON.minStars)
        products = products.filter((el)=> el.stars()>= filterProductInputJSON.minStars)
    return products
}

function createFilterJSON(data){

    if (data == null)
        return {}
    let query = {};
    if (data.categories)
        query.category = data.categories
    if (data.minPrice)
        query.price = { $gte: data.minPrice }
    if (data.maxPrice)
        query.price = { $lte: data.maxPrice }
    //if (data.minStars)
       //query.stars = { $gte: data.minStars }
    //console.log(query)
    return query
}

const createProduct = async (args, context, info) =>
{
    const productJSON = args["createProductInput"]

    const product = new Product({
        name: productJSON.name,
        createdAt: new Date(),
        description: productJSON.description,
        price: productJSON.price,
        comments: [],
        category: productJSON.category
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

    //Add the new comment in the list of comments belonging to the product and then update the database
    product["comments"].push(comment)
    await Product.updateOne(
        { _id: productId },
        { comments: product["comments"] },
        (err) => {
            if (err) throw err;
        }
    )

    //Save the comment in the proper database collection and then retrieve it to the client
    return await comment.save()
}

const Service = { getProducts, createProduct, createComment }

export default  Service
