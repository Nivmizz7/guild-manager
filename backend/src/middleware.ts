import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = req.session.user;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin role required' });
  }
  req.user = req.session.user;
  next();
}
