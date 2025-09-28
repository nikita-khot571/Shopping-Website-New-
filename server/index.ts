import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { typeDefs, resolvers } from './schema';
import { setupDatabase } from './database/setup';

dotenv.config();

async function startServer() {
    const app = express();
    
    // Middleware
    app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Health check
    app.get('/health', (_req: Request, res: Response) => {
        res.json({ status: 'OK', timestamp: new Date() });
    });
    
    // Setup database
    await setupDatabase();
    
    // Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        context: ({ req }) => ({ req, user: (req as any).user })
    });
    
    await server.start();
    server.applyMiddleware({ app: app as any, path: '/graphql' });
    
    // Catch all for SPA
    app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Server: http://localhost:${PORT}`);
        console.log(`🚀 GraphQL: http://localhost:${PORT}/graphql`);
    });
}

startServer().catch(console.error);