declare class ShopZoneServer {
    private app;
    private apolloServer;
    private httpServer;
    constructor();
    private setupMiddleware;
    private createApiRoutes;
    private setupApolloServer;
    start(): Promise<void>;
    private initializeDatabase;
    private setupGracefulShutdown;
}
declare const server: ShopZoneServer;
export default server;
//# sourceMappingURL=index.d.ts.map