import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios';

import { errorToast } from '@/lib/toast.lib';
import { appEnv, ERROR_MESSAGE } from '@/constants';
import type { APIRequestMethodType } from '@/types/api-request.types';

export const axiosInstance = axios.create({
  baseURL: appEnv.BACKEND_BASE_URL,
  timeout: 20000,
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response) {
      errorToast({ message: ERROR_MESSAGE.NETWORK_ERROR });
    } else if (error.response.status === 422) {
      errorToast({ message: ERROR_MESSAGE.VALIDATION_ERROR });
    } else {
      errorToast({ message: ERROR_MESSAGE.INTERNAL_SERVER_ERROR });
    }
    return Promise.reject(error);
  }
);

interface RequestConfig extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  url: string;
  method: APIRequestMethodType;
  params?: object;
}

export const apiRequest = <T = unknown>({
  url,
  params = {},
  method,
  ...rest
}: RequestConfig): Promise<AxiosResponse<T>> => {
  return axiosInstance({ url, method, params, ...rest });
};
