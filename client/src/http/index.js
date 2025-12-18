import axios from "axios";

const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true, 
  });

  return instance;
};

export const $host = createInstance(process.env.REACT_APP_API_URL);

export const $authHost = createInstance(process.env.REACT_APP_API_URL);

export const $propsHost = createInstance('');