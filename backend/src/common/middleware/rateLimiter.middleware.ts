import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

const rateLimitHandler = (req: Request, res: Response): void => {
  res.status(429).json({
    success: false,
    msg: "Too many requests, please try again later.",
  });
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   
  max: 100,                    
  standardHeaders: true,       
  legacyHeaders: false,        
  handler: rateLimitHandler,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                     
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const claimLimiter = rateLimit({
  windowMs: 60 * 1000,         
  max: 5,                      
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});