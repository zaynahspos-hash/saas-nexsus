import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Tenant } from '../models/Schemas';

export interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
  headers: any;
  body: any;
  params: any;
}

export const protect = async (req: any, res: any, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) throw new Error("User not found");

      req.tenant = await Tenant.findById(req.user.tenantId);
      if (!req.tenant || req.tenant.status === 'SUSPENDED') {
         res.status(403).json({ message: 'Tenant access suspended or invalid' });
         return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req: any, res: any, next: NextFunction) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};