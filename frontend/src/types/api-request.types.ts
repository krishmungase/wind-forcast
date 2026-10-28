import type { REQUEST_METHOD } from '@/constants';

export type APIRequestMethodType =
  (typeof REQUEST_METHOD)[keyof typeof REQUEST_METHOD];
