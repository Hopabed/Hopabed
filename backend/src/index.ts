import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import express, { type Request as ExpressRequest, type Response as ExpressResponse, type NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import propertiesRouter from './routes/properties.js';
import bookingsRouter from './routes/bookings.js';
import hostsRouter from './routes/hosts.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';
import verificationRouter from './routes/verification.js';
import invoicesRouter from './routes/invoices.js';
import { outreachRouter } from './routes/outreach.js';
import grievancesRouter from './routes/grievances.js';

export const app = express();

app.disable('x-powered-by');
if (process.env.CF_WORKER !== 'true') {
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    })
  );
}

app.use(
  cors({
    origin: env.CORS_ORIGIN || '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-csrf-token', 'X-Client-Type', 'x-client-type'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/uploads/public', express.static(path.resolve(process.cwd(), 'uploads', 'public')));

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/', (_req: ExpressRequest, res: ExpressResponse) => {
  res.json({
    message: 'Hopebed backend is running',
    status: 'ok',
  });
});

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/hosts', hostsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/grievances', grievancesRouter);
app.use('/api', outreachRouter);

async function handleWorkerFetch(request: any, envBindings: any): Promise<any> {
  if (envBindings) {
    for (const [key, value] of Object.entries(envBindings)) {
      if (typeof value === 'string') {
        process.env[key] = value;
      }
    }
  }

  const origin = request.headers.get('Origin') || '*';

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, x-csrf-token, X-Client-Type, x-client-type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    await connectDatabase();
  } catch (err) {
    console.error('Database connection error in worker:', err);
  }

  let bodyBuffer: Buffer | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const arrayBuf = await request.arrayBuffer();
      if (arrayBuf.byteLength > 0) {
        bodyBuffer = Buffer.from(arrayBuf);
      }
    } catch (e) {
      console.error('Error reading request body in worker:', e);
    }
  }

  return new Promise<any>((resolve) => {
    try {
      const url = new URL(request.url);
      const socket = new Socket();
      Object.defineProperty(socket, 'remoteAddress', { value: request.headers.get('cf-connecting-ip') || '127.0.0.1' });

      const req = new IncomingMessage(socket) as any;
      req.method = request.method;
      req.url = url.pathname + url.search;
      req.ip = request.headers.get('cf-connecting-ip') || '127.0.0.1';

      if (request.headers && typeof request.headers.forEach === 'function') {
        request.headers.forEach((val: string, key: string) => {
          req.headers[key.toLowerCase()] = val;
        });
      }

      req._body = true;

      if (bodyBuffer) {
        req.rawBody = new TextDecoder().decode(bodyBuffer);
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            req.body = JSON.parse(req.rawBody);
          } catch (e) {
            req.body = {};
          }
        } else {
          req.body = {};
        }
      } else {
        req.rawBody = '';
        req.body = {};
      }

      const res = new ServerResponse(req) as any;
      const responseHeaders = new Headers();
      responseHeaders.set('Access-Control-Allow-Origin', origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');

      const chunks: Uint8Array[] = [];

      res.writeHead = function (statusCode: number, statusMessage?: any, headers?: any) {
        res.statusCode = statusCode;
        let hdrs = headers;
        if (typeof statusMessage === 'object') {
          hdrs = statusMessage;
        }
        if (hdrs) {
          for (const [k, v] of Object.entries(hdrs)) {
            if (Array.isArray(v)) {
              v.forEach(val => responseHeaders.append(k, String(val)));
            } else if (v !== undefined) {
              responseHeaders.set(k, String(v));
            }
          }
        }
        return res;
      };

      res.setHeader = function (name: string, value: any) {
        if (Array.isArray(value)) {
          responseHeaders.delete(name);
          value.forEach(v => responseHeaders.append(name, String(v)));
        } else {
          responseHeaders.set(name, String(value));
        }
        return res;
      };

      res.getHeader = function (name: string) {
        return responseHeaders.get(name) || undefined;
      };

      res.getHeaderNames = function () {
        return Array.from(responseHeaders.keys ? responseHeaders.keys() : []);
      };

      res.removeHeader = function (name: string) {
        responseHeaders.delete(name);
      };

      res.write = function (chunk: any) {
        if (chunk) {
          if (typeof chunk === 'string') {
            chunks.push(new TextEncoder().encode(chunk));
          } else {
            chunks.push(chunk);
          }
        }
        return true;
      };

      res.end = function (chunk?: any) {
        if (chunk) {
          if (typeof chunk === 'string') {
            chunks.push(new TextEncoder().encode(chunk));
          } else {
            chunks.push(chunk);
          }
        }

        let totalLen = 0;
        for (const c of chunks) totalLen += c.length;
        const responseBuffer = new Uint8Array(totalLen);
        let offset = 0;
        for (const c of chunks) {
          responseBuffer.set(c, offset);
          offset += c.length;
        }

        const finalResponse = new Response(responseBuffer, {
          status: res.statusCode || 200,
          headers: responseHeaders,
        });

        resolve(finalResponse);
        return res;
      };

      app(req, res);
    } catch (err: any) {
      console.error('Error handling request in worker:', err);
      resolve(new Response(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        },
      }));
    }
  });
}

export default {
  fetch: handleWorkerFetch,
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log(`Backend server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
};

if (process.env.CF_WORKER !== 'true' && env.NODE_ENV !== 'test') {
  void startServer();
}

