import { env } from './env.js';
import { getMongoose } from '../models/modelUtils.js';

export const connectDatabase = async (): Promise<void> => {
  const mongoose = getMongoose();
  if (!mongoose || !mongoose.connection) {
    console.error('Mongoose instance or connection is undefined!', { mongooseDefault, mongooseNamespace });
    return;
  }

  if ((mongoose.connection.readyState as number) === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    // Already connecting, wait up to 3 seconds for state to change to 1
    let tries = 0;
    while (mongoose.connection.readyState === 2 && tries < 30) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      tries++;
    }
    if ((mongoose.connection.readyState as number) === 1) return;
  }

  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
      socketTimeoutMS: 30000,
      retryWrites: true,
    });
    console.log(`MongoDB connected: ${env.MONGODB_DB_NAME}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  const mongoose = getMongoose();
  if (mongoose?.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

export const getMongoConnectionStatus = (): boolean => {
  const mongoose = getMongoose();
  return (mongoose?.connection?.readyState as number) === 1;
};



