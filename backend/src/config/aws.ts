import { env, requireAwsEnv } from './env';

export const awsConfig = {
  get isConfigured(): boolean {
    return Boolean(
      env.AWS_ACCESS_KEY && env.AWS_SECRET_KEY && env.AWS_REGION && env.AWS_BUCKET_NAME,
    );
  },
  get credentials() {
    return requireAwsEnv();
  },
};
