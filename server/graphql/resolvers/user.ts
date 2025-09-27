import { Context } from '../../types/context';
import { User, Address, PaymentMethod, Order } from '../../database/models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const userResolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: Context) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }
            return context.user;
        },

        users: async (_parent: any, _args: any, context: Context) => {
            if (!context.user || context.user.role !== 'admin') {
                throw new Error('Not authorized');
            }
            return User.findAll();
        },

        user: async (_parent: any, { id }: { id: string }, context: Context) => {
            if (!context.user || (context.user.role !== 'admin' && context.user.id !== id)) {
                throw new Error('Not authorized');
            }
            return User.findByPk(id);
        }
    },

    Mutation: {
        register: async (_parent: any, { input }: { input: any }) => {
            const existingUser = await User.findOne({ where: { email: input.email } });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const user = await User.create({
                ...input,
                role: 'customer',
                emailVerified: false,
                isActive: true
            });

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '7d' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
                { expiresIn: '30d' }
            );

            return { token, refreshToken, user };
        },

        login: async (_parent: any, { input }: { input: any }) => {
            const user = await User.findOne({ where: { email: input.email } });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isValidPassword = await user.comparePassword(input.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '7d' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id },
                process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
                { expiresIn: '30d' }
            );

            return { token, refreshToken, user };
        },

        updateProfile: async (_parent: any, { input }: { input: any }, context: Context) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }

            const user = await User.findByPk(context.user.id);
            if (!user) {
                throw new Error('User not found');
            }

            await user.update(input);
            return user;
        },

        changePassword: async (
            _parent: any, 
            { currentPassword, newPassword }: { currentPassword: string; newPassword: string }, 
            context: Context
        ) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }

            const user = await User.findByPk(context.user.id);
            if (!user) {
                throw new Error('User not found');
            }

            const isValidPassword = await user.comparePassword(currentPassword);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await user.update({ password: hashedPassword });

            return true;
        }
    },

    User: {
        addresses: async (user: any) => {
            return Address.findAll({ where: { userId: user.id } });
        },

        paymentMethods: async (user: any) => {
            return PaymentMethod.findAll({ where: { userId: user.id, isActive: true } });
        },

        orders: async (user: any) => {
            return Order.findAll({ 
                where: { userId: user.id },
                order: [['createdAt', 'DESC']]
            });
        }
    }
};