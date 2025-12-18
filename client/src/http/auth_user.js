import { $host } from "./index";
import { t } from '../utils/t18';

export const login = async (email, password, remember) => {
  try {
    const response = await $host.post('api/auth/login', { email, password, remember });
    return response.data; 
  } catch (error) {
    console.error(t('auth_user_7'), error);
    throw new Error(error.response?.data?.message || t('auth_user_6'));
  }
};

export const logout = async () => {
  try {
    await $host.post('api/auth/logout');
    return { success: true };
  } catch (error) {
    console.warn(t('auth_user_5'), error);
    return { success: true };
  }
};

export const changePAssword = async(login, old, pass, confirm_pass)=>{
  try{
     const response = await $host.post('api/auth/change_password', { login, old, pass, confirm_pass });
    return response.data; 
  }catch(e){
    if (e.response?.status === 401) {
      window.location.href = "/auth";
    }
    return null;
  }
}

export const changeLogin = async(old, login, pass)=>{
  try{
     const response = await $host.post('api/auth/change_login', { old, login, pass });
    return response.data; 
  }catch(e){
    if (e.response?.status === 401) {
      window.location.href = "/auth";
    }
    return null;
  }
}

export const checkAuth = async () => {
  try {
    const response = await $host.get('api/auth/check');
    return response.data; 
  } catch (e) {
    console.error(t('auth_user_3'), e);

    if (e.response?.status === 401) {
      window.location.href = "/auth";
    }

    return null;
  }
};