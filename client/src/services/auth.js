import { $host } from '../http/index';

export const checkAuth = async () => {
  try {
    const response = await $host.get('api/auth/check');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};