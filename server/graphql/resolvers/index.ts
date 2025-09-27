import { userResolvers } from './user';
import { productResolvers } from './product';
import { cartResolvers } from './cart';
import { orderResolvers } from './order';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

// Custom scalar types
const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value: any) {
        return value instanceof Date ? value.getTime() : value;
    },
    parseValue(value: any) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        return null;
    }
});

const jsonScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value: any) {
        return value;
    },
    parseValue(value: any) {
        return value;
    },
    parseLiteral(ast: any) {
        return ast.value;
    }
});

export const resolvers = {
    Date: dateScalar,
    JSON: jsonScalar,
    
    Query: {
        ...userResolvers.Query,
        ...productResolvers.Query,
        ...cartResolvers.Query,
        ...orderResolvers.Query
    },
    
    Mutation: {
        ...userResolvers.Mutation,
        ...productResolvers.Mutation,
        ...cartResolvers.Mutation,
        ...orderResolvers.Mutation
    },

    // Type resolvers
    User: userResolvers.User,
    Product: productResolvers.Product,
    Cart: cartResolvers.Cart,
    CartItem: cartResolvers.CartItem,
    Order: orderResolvers.Order,
    OrderItem: orderResolvers.OrderItem
};

// Default export for easier importing
export default resolvers;