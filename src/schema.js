import {makeExecutableSchema} from "graphql-tools";
import Service from "./service/Service.js"

const typeDefs = `
    scalar DateTime,
    enum ProductCategory {
        STYLE
        FOOD
        TECH
        SPORT
    },
    enum SortingValue {
        createdAt
        price
    },
    enum SortingOrder {
        asc
        desc
    },
    input ProductCreateInput {
        name : String!,
        description : String,
        price : Float!,
        category: ProductCategory!
    },
    input CommentCreateInput {
        title: String!,
        body: String,
        stars: Int!
    }
    type Comment {
        _id: ID!,
        title: String!,
        body: String,
        stars: Int!,
        date: DateTime!
    },
    type Product {
        _id: ID!,
        name: String!,
        createdAt: DateTime!,
        description: String,
        price: Float!,
        comments (last: Int) : [Comment],
        category: ProductCategory!,
        stars: Float
    },
    input ProductFilterInput {
        categories: [ProductCategory],
        minStars: Int,
        minPrice: Float,
        maxPrice: Float
    },
    input ProductSortInput {
        value: SortingValue!,
        order: SortingOrder!
    },
    type Query {
        products (filter: ProductFilterInput, sort: ProductSortInput) : [Product],
        product (id: ID!) : Product,
    },
    type Mutation {
        productCreate (productCreateInput: ProductCreateInput!) : Product,
        commentCreate (
            commentCreateInput: CommentCreateInput!,
            productId: ID!
        ) : Comment
    }
`

const resolvers = {
    Query: {
        products: (parent, args, context, info) => { return Service.getProducts(args, context, info) },
        product: (parents, args, context, info) => { return Service.getProductById(args) }
    },
    Mutation: {
        productCreate: (parent, args, context, info) => { return Service.createProduct(args, context, info) },
        commentCreate: (parent, args, context, info) => { return Service.createComment(args, context, info) },
    },
    Product:{
        comments: (parent, args, context, info) =>{ return Service.getComments(parent,args,context,info) }
    }
}
const schema = makeExecutableSchema({typeDefs, resolvers})

export default schema
