import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import express, { type Request, type Response, type NextFunction } from 'express';
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
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
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

app.get('/', (_req: Request, res: Response) => {
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

async function handleWorkerFetch(request: Request, envBindings: any): Promise<Response> {
  if (envBindings) {
    for (const [key, value] of Object.entries(envBindings)) {
      if (typeof value === 'string') {
        process.env[key] = value;
      }
    }
  }

  try {
    await connectDatabase();
  } catch (err) {
    console.error('Database connection error in worker:', err);
  }

  return new Promise<Response>(async (resolve) => {
    const url = new URL(request.url);
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = request.method;
    req.url = url.pathname + url.search;

    request.headers.forEach((val, key) => {
      req.headers[key.toLowerCase()] = val;
    });

    const res = new ServerResponse(req);
    const responseHeaders = new Headers();
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
      return Array.from((responseHeaders as any).keys ? (responseHeaders as any).keys() : []);
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
      const bodyBuffer = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) {
        bodyBuffer.set(c, offset);
        offset += c.length;
      }

      const finalResponse = new Response(bodyBuffer, {
        status: res.statusCode || 200,
        headers: responseHeaders,
      });

      resolve(finalResponse);
      return res;
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const bodyArrayBuffer = await request.arrayBuffer();
        if (bodyArrayBuffer.byteLength > 0) {
          req.push(Buffer.from(bodyArrayBuffer));
        }
      } catch (e) {
        console.error('Error reading request body in worker:', e);
      }
    }
    req.push(null);

    app(req, res);
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

