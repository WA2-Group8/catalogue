"use script";

function getProducts(args, context, info)
{
    console.log("getProducts")
}

function createComment(args, context, info)
{
    console.log("createComment")
    return "ciao"
}

const Service = { getProducts, createComment }

export default  Service
