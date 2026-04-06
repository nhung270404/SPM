import mongoose, {Model} from 'mongoose';

export interface IConfigSocial {
  name: string
  url: string
}

export interface IConfig {
  title: string
  description: string
  keywords: string[]
  address: string
  phone: string[]
  url: string
  api: string
  social: IConfigSocial[]
}

const ConfigSocialSchema = new mongoose.Schema<IConfigSocial>({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
}, { _id: false });

const ConfigSchema = new mongoose.Schema<IConfig>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: [String],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  api: {
    type: String,
    required: true,
  },
  social: {
    type: [ConfigSocialSchema],
    required: true,
  },
});

const ConfigModel: Model<IConfig> = mongoose.models.Config || mongoose.model('Config', ConfigSchema);

export default ConfigModel