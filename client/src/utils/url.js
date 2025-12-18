    
  // Функция для добавления параметра в URL
 export const addUrlParam = (paramValue) => {
    if (window.history && window.history.pushState) {
      const newUrl = `${window.location.pathname}?${paramValue}`;
      window.history.pushState({}, '', newUrl);
    }
  };
  
  // Функция для получения параметра из URL
 export const getUrlParam = () => {
    return new URLSearchParams(window.location.search).toString();
  };

  // Функция для получения конкретного параметра по имени
 export const getUrlParamByName = (paramName) => {
    return new URLSearchParams(window.location.search).get(paramName);
  };