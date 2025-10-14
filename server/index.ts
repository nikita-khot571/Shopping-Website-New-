import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
import { typeDefs, resolvers } from './schema';
import { setupDatabase } from './database/setup';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function startServer() {
    console.log('🚀 Starting ShopZone Server...');
    
    const app = express();
    const PORT = process.env.PORT || 4001;
    
    app.use(cors({
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
    
    app.options('*', cors());
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));
    
    app.get('/health', (_req: Request, res: Response) => {
        res.json({
            status: 'OK',
            timestamp: new Date(),
            database: 'MySQL',
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        });
    });

    app.post('/api/send-email', async (req: Request, res: Response) => {
        try {
            const { name, email, message } = req.body;

            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Name, email, and message are required' });
            }

            // Create transporter (using Gmail as example - configure as needed)
            const transporter = nodemailer.createTransport({
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
        } catch (error) {
            console.error('Email sending error:', error);
            res.status(500).json({ error: 'Failed to send email' });
        }
    });

    try {
        await setupDatabase();
        console.log('✅ Database initialized successfully');
        
        const server = new ApolloServer({
            typeDefs,
            resolvers,
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
            app: app as any, 
            path: '/graphql',
            // Remove cors: false to allow global cors middleware to work properly
        });
        
        console.log('✅ GraphQL server initialized');
        
        app.get('/', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });
        
        app.get('/login', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/login.html'));
        });
        
        app.get('/signup', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/signup.html'));
        });
        
        app.get('/cart', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/cart.html'));
        });
        
        app.get('/product', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/product.html'));
        });
        
        app.get('/admin', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/admin.html'));
        });
        
        app.get('*', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });
        
        app.use((error: any, req: Request, res: Response, next: any) => {
            console.error('❌ Express Error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });
        
        app.listen(PORT, () => {
            console.log('\n🎉 ShopZone Server is running!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🌐 Server:         http://localhost:${PORT}`);
            console.log(`🎮 GraphQL:        http://localhost:${PORT}/graphql`);
            console.log(`📱 Frontend:       http://localhost:3000`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            });
        
    } catch (error) {
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
