"use script";
import {to} from 'await-to-js'
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
    let query = {}
    if (data.categories)
        query.category = data.categories
    const minPrice = (data.minPrice) ? data.minPrice : 0
    const maxPrice = (data.maxPrice) ? data.maxPrice : Number.MAX_VALUE
    if (minPrice > maxPrice)
        throw "minPrice is greater than maxPrice"
    query.price = { $gte: minPrice, $lte: maxPrice }

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

    //Retrieve the created comment to the client
    //return await comment.save()
    return comment
}

const getProductById = async function(args) {
    const id = args["id"]

    let [err, product] = await to(Product.findById(id))
    if(err) throw(err)

    return product
}

const Service = { getProducts, getProductById, createProduct, createComment }

export default Service
