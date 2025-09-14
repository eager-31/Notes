import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface UserJwtPayload {
  userId: string;
  tenantId: string;
  role: 'ADMIN' | 'MEMBER';
  iat: number;
  exp: number;
}

export const getAuth = (request: NextRequest): UserJwtPayload | null => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};