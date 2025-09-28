import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { typeDefs, resolvers } from './schema';
import { setupDatabase } from './database/setup';

// Load environment variables
dotenv.config();

async function startServer() {
    console.log('🚀 Starting ShopZone Server...');
    
    const app = express();
    const PORT = process.env.PORT || 4000;
    
    // Middleware
    app.use(cors({ 
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'], 
        credentials: true 
    }));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
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
            introspection: true, // Enable GraphQL Playground
            context: ({ req }) => ({ req }),
            formatError: (err) => {
                console.error('❌ GraphQL Error:', err.message);
                console.error('Stack:', err.stack);
                return {
                    message: err.message,
                    code: err.extensions?.code,
                    path: err.path
                };
            },
            formatResponse: (response) => {
                // Log successful queries
                if (response.data && !response.errors) {
                    // console.log('✅ GraphQL Query successful');
                }
                return response;
            }
        });
        
        await server.start();
        server.applyMiddleware({ 
            app: app as any, 
            path: '/graphql',
            cors: false // We handle CORS above
        });
        
        console.log('✅ GraphQL server initialized');
        
        // API Routes for direct REST calls (fallback)
        app.post('/api/auth/login', async (req: Request, res: Response) => {
            try {
                const { email, password } = req.body;
                console.log('🔄 Login attempt for:', email);
                
                if (!email || !password) {
                    return res.status(400).json({ 
                        errors: [{ message: 'Email and password are required' }] 
                    });
                }
                
                // This would normally call the GraphQL resolver directly
                // For now, we'll return a basic response
                res.json({ 
                    message: 'Please use GraphQL endpoint at /graphql',
                    endpoint: '/graphql'
                });
                
            } catch (error) {
                console.error('❌ Login API Error:', error);
                res.status(500).json({ 
                    errors: [{ message: 'Internal server error' }] 
                });
            }
        });
        
        app.post('/api/auth/register', async (req: Request, res: Response) => {
            try {
                const { email, firstName, lastName } = req.body;
                console.log('🔄 Register attempt for:', email);
                
                res.json({ 
                    message: 'Please use GraphQL endpoint at /graphql',
                    endpoint: '/graphql'
                });
                
            } catch (error) {
                console.error('❌ Register API Error:', error);
                res.status(500).json({ 
                    errors: [{ message: 'Internal server error' }] 
                });
            }
        });
        
        // Serve static files and SPA routes
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
        
        app.get('/admin', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/admin.html'));
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
            console.log(`📱 Frontend:         http://localhost:3000 (run: npm run client:dev)`);
            console.log(`🏥 Health Check:     http://localhost:${PORT}/health`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 Demo Accounts:');
            console.log('   👑 Admin:    admin@shopzone.com / admin123');
            console.log('   👤 Customer: customer@shopzone.com / customer123');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💡 Tips:');
            console.log('   • Use GraphQL Playground to test queries');
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