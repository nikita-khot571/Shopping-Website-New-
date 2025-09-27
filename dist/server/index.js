"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const apollo_server_express_1 = require("apollo-server-express");
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const schema_1 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const connection_1 = require("./database/connection");
const init_1 = require("./database/init");
const auth_1 = require("./middleware/auth");
const error_1 = require("./middleware/error");
const logging_1 = require("./middleware/logging");
dotenv_1.default.config();
class ShopZoneServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupApolloServer();
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true
        }));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(logging_1.loggingMiddleware);
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
        this.app.use('/api', this.createApiRoutes());
    }
    createApiRoutes() {
        const router = express_1.default.Router();
        router.post('/webhook/payment', express_1.default.raw({ type: 'application/json' }), (req, res) => {
            res.status(200).send('OK');
        });
        router.post('/upload', auth_1.authMiddleware, (req, res) => {
            res.status(200).json({ message: 'Upload endpoint' });
        });
        return router;
    }
    async setupApolloServer() {
        this.apolloServer = new apollo_server_express_1.ApolloServer({
            typeDefs: schema_1.typeDefs,
            resolvers: resolvers_1.resolvers,
            context: ({ req, res }) => {
                return {
                    req,
                    res,
                    user: req.user || null,
                    dataSources: {}
                };
            },
            formatError: (error) => {
                console.error('GraphQL Error:', error);
                if (process.env.NODE_ENV === 'production') {
                    if (error.message.startsWith('Database')) {
                        return new Error('Internal server error');
                    }
                }
                return error;
            },
            formatResponse: (response, { request }) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('GraphQL Query:', request.query);
                }
                return response;
            },
            introspection: process.env.NODE_ENV === 'development',
            playground: process.env.NODE_ENV === 'development'
        });
    }
    async start() {
        try {
            await this.initializeDatabase();
            await this.apolloServer.start();
            this.apolloServer.applyMiddleware({
                app: this.app,
                path: '/graphql',
                cors: false
            });
            this.app.use(error_1.errorMiddleware);
            this.app.get('*', (req, res) => {
                res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
            });
            this.httpServer = (0, http_1.createServer)(this.app);
            const PORT = process.env.PORT || 4000;
            this.httpServer.listen(PORT, () => {
                console.log(`🚀 Server ready at http://localhost:${PORT}`);
                console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}${this.apolloServer.graphqlPath}`);
                console.log(`🚀 GraphQL Playground: http://localhost:${PORT}${this.apolloServer.graphqlPath}`);
            });
            this.setupGracefulShutdown();
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async initializeDatabase() {
        try {
            await connection_1.sequelize.authenticate();
            console.log('✅ Database connection established successfully.');
            await (0, init_1.initializeDatabase)();
            console.log('✅ Database initialized successfully.');
        }
        catch (error) {
            console.error('❌ Unable to connect to database:', error);
            throw error;
        }
    }
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
            try {
                if (this.httpServer) {
                    await new Promise((resolve, reject) => {
                        this.httpServer.close((error) => {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                }
                if (this.apolloServer) {
                    await this.apolloServer.stop();
                }
                await connection_1.sequelize.close();
                console.log('✅ Database connections closed.');
                console.log('✅ Graceful shutdown completed.');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
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
const server = new ShopZoneServer();
if (require.main === module) {
    server.start().catch((error) => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });
}
exports.default = server;
//# sourceMappingURL=index.js.map