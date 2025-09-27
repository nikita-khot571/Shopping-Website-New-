import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import path from 'path';
import dotenv from 'dotenv';

// Import GraphQL schema and resolvers
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

// Import database connection
import { sequelize } from './database/connection';
import { setupAssociations } from './database/models';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { errorMiddleware } from './middleware/error';
import { loggingMiddleware } from './middleware/logging';

// Import types
import { Context } from './types/context';

// Load environment variables
dotenv.config();

class ShopZoneServer {
    private app: express.Application;
    private apolloServer: ApolloServer;
    private httpServer: any;

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupApolloServer();
    }

    private setupMiddleware(): void {
        // Enable CORS
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true
        }));

        // Parse JSON bodies
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging middleware
        this.app.use(loggingMiddleware);

        // Serve static files
        this.app.use(express.static(path.join(__dirname, '../public')));

        // Health check endpoint
        this.app.get('/health', (_req: Request, res: Response) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // API routes (if needed for non-GraphQL endpoints)
        this.app.use('/api', this.createApiRoutes());
    }

    private createApiRoutes(): express.Router {
        const router = express.Router();

        // Payment webhook (Stripe)
        router.post('/webhook/payment', express.raw({ type: 'application/json' }), (_req: Request, res: Response) => {
            // Handle payment webhooks here
            res.status(200).send('OK');
        });

        // File upload endpoint
        router.post('/upload', authMiddleware, (_req: Request, res: Response) => {
            // Handle file uploads here
            res.status(200).json({ message: 'Upload endpoint' });
        });

        return router;
    }

    private async setupApolloServer(): Promise<void> {
        this.apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
            context: ({ req, res }): Context => {
                return {
                    req,
                    res,
                    user: (req as any).user || null
                };
            },
            formatError: (error) => {
                console.error('GraphQL Error:', error);
                
                // Don't expose internal server errors to client in production
                if (process.env.NODE_ENV === 'production') {
                    if (error.message.startsWith('Database')) {
                        return new Error('Internal server error');
                    }
                }
                
                return error;
            },
            formatResponse: (response, { request }) => {
                // Log queries in development
                if (process.env.NODE_ENV === 'development') {
                    console.log('GraphQL Query:', request.query);
                }
                return response;
            },
            introspection: process.env.NODE_ENV === 'development'
        });
    }

    public async start(): Promise<void> {
        try {
            // Initialize database
            await this.initializeDatabase();

            // Start Apollo Server
            await this.apolloServer.start();

            // Apply Apollo GraphQL middleware
            this.apolloServer.applyMiddleware({ 
                app: this.app as any, 
                path: '/graphql',
                cors: false // We've already set up CORS above
            });

            // Add error handling middleware (should be last)
            this.app.use(errorMiddleware);

            // Handle 404s
            this.app.get('*', (_req: Request, res: Response) => {
                res.sendFile(path.join(__dirname, '../public/index.html'));
            });

            // Create HTTP server
            this.httpServer = createServer(this.app);

            const PORT = process.env.PORT || 4000;

            // Start server
            this.httpServer.listen(PORT, () => {
                console.log(`🚀 Server ready at http://localhost:${PORT}`);
                console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}${this.apolloServer.graphqlPath}`);
            });

            // Graceful shutdown
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    private async initializeDatabase(): Promise<void> {
        try {
            // Test database connection
            await sequelize.authenticate();
            console.log('✅ Database connection established successfully.');

            // Setup model associations
            setupAssociations();

            // Sync database (create tables if they don't exist)
            await sequelize.sync({ force: false });
            console.log('✅ Database synchronized successfully.');

        } catch (error) {
            console.error('❌ Unable to connect to database:', error);
            throw error;
        }
    }

    private setupGracefulShutdown(): void {
        const shutdown = async (signal: string) => {
            console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

            try {
                // Stop accepting new connections
                if (this.httpServer) {
                    await new Promise<void>((resolve, reject) => {
                        this.httpServer.close((error: any) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    });
                }

                // Stop Apollo Server
                if (this.apolloServer) {
                    await this.apolloServer.stop();
                }

                // Close database connections
                await sequelize.close();
                console.log('✅ Database connections closed.');

                console.log('✅ Graceful shutdown completed.');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };

        // Listen for termination signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle uncaught exceptions and unhandled rejections
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            shutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown('unhandledRejection');
        });
    }
}

// Start the server
const server = new ShopZoneServer();

if (require.main === module) {
    server.start().catch((error) => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
}

export default server;