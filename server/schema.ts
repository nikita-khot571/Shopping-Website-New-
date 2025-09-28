import { gql } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Product } from './database/setup';
import { Op } from 'sequelize';

export const typeDefs = gql`
    type User {
        id: ID!
        email: String!
        firstName: String!
        lastName: String!
        role: String!
    }
    
    type Product {
        id: ID!
        name: String!
        description: String
        price: Float!
        category: String!
        stock: Int!
    }
    
    type AuthPayload {
        token: String!
        user: User!
    }
    
    type Query {
        products(category: String, search: String): [Product!]!
        me: User
    }
    
    type Mutation {
        register(email: String!, password: String!, firstName: String!, lastName: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
    }
`;

export const resolvers = {
    Query: {
        products: async (_: any, { category, search }: any) => {
            const where: any = {};
            if (category && category !== 'all') where.category = category;
            if (search) where.name = { [Op.like]: `%${search}%` };
            return Product.findAll({ where });
        },
        me: async (_: any, __: any, { user }: any) => user
    },
    
    Mutation: {
        register: async (_: any, { email, password, firstName, lastName }: any) => {
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await User.create({
                email, password: hashedPassword, firstName, lastName, role: 'customer'
            });
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
            return { token, user };
        },
        
        login: async (_: any, { email, password }: any) => {
            const user = await User.findOne({ where: { email } });
            if (!user || !await bcrypt.compare(password, user.password)) {
                throw new Error('Invalid credentials');
            }
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
            return { token, user };
        }
    }
};