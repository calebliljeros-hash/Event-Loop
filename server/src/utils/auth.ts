import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import type { Request } from 'express';

const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const expiration = '2h';

interface TokenPayload {
  _id: string;
  username: string;
  email: string;
}

// Sign a new token — accepts Mongoose documents or plain objects
export function signToken(user: { _id: unknown; username: string; email: string }): string {
  const payload: TokenPayload = {
    _id: String(user._id),
    username: user.username,
    email: user.email,
  };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
}

// Extract user from request context
// Returns { user } if valid token, { user: null } if not
// Does NOT throw — individual resolvers decide whether auth is required
export async function authenticateContext({ req }: { req: Request }) {
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return { user: null };
  }

  try {
    const { data } = jwt.verify(token, secret) as { data: TokenPayload };
    return { user: data };
  } catch {
    return { user: null };
  }
}

// Reusable auth error
export class AuthenticationError extends GraphQLError {
  constructor(message = 'You must be logged in') {
    super(message, {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}
