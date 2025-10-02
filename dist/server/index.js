"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const schema_1 = require("./schema");
const setup_1 = require("./database/setup");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
async function startServer() {
    console.log('🚀 Starting ShopZone Server...');
    const app = (0, express_1.default)();
    const PORT = process.env.PORT || 4001;
    app.use((0, cors_1.default)({
        origin: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'https://studio.apollographql.com'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        maxAge: 86400
    }));
    app.options('*', (0, cors_1.default)());
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
    app.get('/health', (_req, res) => {
        res.json({
            status: 'OK',
            timestamp: new Date(),
            database: 'MySQL',
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        });
    });
    app.post('/api/send-email', async (req, res) => {
        try {
            const { name, email, message } = req.body;
            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Name, email, and message are required' });
            }
            // Create transporter (using Gmail as example - configure as needed)
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            const mailOptions = {
                from: email,
                to: process.env.CONTACT_EMAIL || 'contact@shopzone.com',
                subject: `Contact Form Message from ${name}`,
                html: `
                    <h3>New Contact Form Submission</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                `
            };
            await transporter.sendMail(mailOptions);
            res.json({ success: true, message: 'Email sent successfully' });
        }
        catch (error) {
            console.error('Email sending error:', error);
            res.status(500).json({ error: 'Failed to send email' });
        }
    });
    try {
        console.log('🔄 Initializing database...');
        await (0, setup_1.setupDatabase)();
        console.log('✅ Database initialized successfully');
        console.log('🔄 Setting up GraphQL server...');
        const server = new apollo_server_express_1.ApolloServer({
            typeDefs: schema_1.typeDefs,
            resolvers: schema_1.resolvers,
            introspection: true,
            context: ({ req }) => ({ req }),
            csrfPrevention: false,
            cache: 'bounded',
            formatError: (err) => {
                console.error('❌ GraphQL Error:', err.message);
                return {
                    message: err.message,
                    code: err.extensions?.code,
                    path: err.path
                };
            }
        });
        await server.start();
        server.applyMiddleware({
            app: app,
            path: '/graphql',
            // Remove cors: false to allow global cors middleware to work properly
        });
        console.log('✅ GraphQL server initialized');
        app.get('/', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
        });
        app.get('/login', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../public/login.html'));
        });
        app.get('/signup', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../public/signup.html'));
        });
        app.get('/cart', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../public/cart.html'));
        });
        app.get('/admin', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../public/admin.html'));
        });
        app.get('*', (_req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
        });
        app.use((error, req, res, next) => {
            console.error('❌ Express Error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });
        app.listen(PORT, () => {
            console.log('\n🎉 ShopZone Server is running!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🌐 Server:           http://localhost:${PORT}`);
            console.log(`🎮 GraphQL:          http://localhost:${PORT}/graphql`);
            console.log(`📱 Frontend:         http://localhost:3000`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 Demo Accounts:');
            console.log('   👑 Admin:    admin@shopzone.com / admin123');
            console.log('   👤 Customer: customer@shopzone.com / customer123');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        });
    }
    catch (error) {
        console.error('❌ Server startup failed:', error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
        process.exit(1);
    }
}
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
