import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '@shared/types'

export interface AuthRequest extends Request {
  user?: {
    id: string
    role: UserRole
  }
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      role: UserRole
    }

    // Map userId to id for consistency in the request object
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}
