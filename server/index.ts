import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { typeDefs, resolvers } from './schema';
import { setupDatabase } from './database/setup';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function startServer() {
    console.log('🚀 Starting ShopZone Server...');
    
    const app = express();
    const PORT = process.env.PORT || 4000;
    
    // CRITICAL: CORS must be configured BEFORE other middleware
    app.use(cors({
        origin: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'https://studio.apollographql.com' // For Apollo Studio
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        maxAge: 86400 // 24 hours
    }));
    
    // Handle preflight requests
    app.options('*', cors());
    
    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Static files
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
        res.json({ 
            status: 'OK', 
            timestamp: new Date(),
            database: 'SQLite',
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0'
        });
    });
    
    // API endpoint for testing
    app.get('/api/test', (_req: Request, res: Response) => {
        res.json({ 
            message: 'ShopZone API is working!',
            timestamp: new Date()
        });
    });
    
    try {
        // Setup database first
        console.log('🔄 Initializing database...');
        await setupDatabase();
        console.log('✅ Database initialized successfully');
        
        // Create Apollo Server
        console.log('🔄 Setting up GraphQL server...');
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            introspection: true,
            context: ({ req }) => ({ req }),
            csrfPrevention: false, // Disable CSRF for development
            cache: 'bounded',
            formatError: (err) => {
                console.error('❌ GraphQL Error:', err.message);
                if (err.extensions?.exception?.stacktrace) {
                    console.error('Stack:', err.extensions.exception.stacktrace);
                }
                return {
                    message: err.message,
                    code: err.extensions?.code,
                    path: err.path
                };
            },
            formatResponse: (response) => {
                // Log successful queries in development
                if (process.env.NODE_ENV === 'development' && response.data && !response.errors) {
                    // console.log('✅ GraphQL Query successful');
                }
                return response;
            }
        });
        
        await server.start();
        
        // Apply Apollo middleware with CORS disabled (we handle it above)
        server.applyMiddleware({ 
            app: app as any, 
            path: '/graphql',
            cors: false // IMPORTANT: We handle CORS ourselves above
        });
        
        console.log('✅ GraphQL server initialized');
        
        // Serve static HTML pages
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
        
        app.get('/checkout', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/checkout.html'));
        });
        
        app.get('/admin', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/admin.html'));
        });
        
        app.get('/profile', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/profile.html'));
        });
        
        // Catch all for SPA - serve index.html for any unmatched routes
        app.get('*', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });
        
        // Error handling middleware
        app.use((error: any, req: Request, res: Response, next: any) => {
            console.error('❌ Express Error:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });
        
        // Start the server
        app.listen(PORT, () => {
            console.log('\n🎉 ShopZone Server is running!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🌐 Server:           http://localhost:${PORT}`);
            console.log(`🎮 GraphQL Playground: http://localhost:${PORT}/graphql`);
            console.log(`🎮 Apollo Studio:    https://studio.apollographql.com/sandbox/explorer`);
            console.log(`📱 Frontend:         http://localhost:3000 (run: npm run client:dev)`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 Demo Accounts:');
            console.log('   👑 Admin:    admin@shopzone.com / admin123');
            console.log('   👤 Customer: customer@shopzone.com / customer123');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💡 Tips:');
            console.log('   • Use Apollo Studio Sandbox for testing');
            console.log('   • GraphQL endpoint: http://localhost:4000/graphql');
            console.log('   • Check database at: ./database/shopzone.db');
            console.log('   • Run "npm run client:dev" in another terminal');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});