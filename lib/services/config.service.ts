import dbConnect from '@/lib/mongo';
import Config, { IConfig } from '@/models/config.model';
import { cache } from 'react';

// Cache trong bộ nhớ để dùng lại giữa các request (Singleton)
let cachedConfig: IConfig | null = null;

export const GetConfig = cache(async (): Promise<IConfig> => {
  if (cachedConfig) return cachedConfig;

  await dbConnect();
  const config = await Config.findOne({}, { _id: 0 }).lean();
  
  if (!config) return {} as IConfig;
  
  cachedConfig = config as IConfig;
  return cachedConfig;
});