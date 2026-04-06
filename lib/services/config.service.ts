import dbConnect from '@/lib/mongo';
import Config, { IConfig } from '@/models/config.model';

export const GetConfig = async (): Promise<IConfig> => {
  await dbConnect();
  const config = await Config.findOne({}, {_id: 0}).lean();
  if (!config) return {} as IConfig;
  return config
}