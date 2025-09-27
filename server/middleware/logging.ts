import { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (req: any, res: any, next: any): void => {
    const start = Date.now();
    
    // Log request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    
    // Log response when finished
    const originalSend = res.json;
    res.json = function(body: any) {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        return originalSend.call(this, body);
    };
    
    next();
};