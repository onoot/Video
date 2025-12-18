
export const USDformat = (text_value)=>{
    /** Форматирование цифр в суммах - пробел каждые три знака и 2 знака после запятой */
    const m_f_options = { useGrouping: true , minimumFractionDigits: 2, maximumFractionDigits: 2 };  
    return Number(text_value).toLocaleString('ru-RU', m_f_options)
}

export const formatDecimals = (value, decimals=18) => {
    try {
        // Убедимся, что value — строка
        let strValue = String(value).replace(/[^0-9]/g, ''); // убираем всё кроме цифр

        if (strValue === '' || decimals < 0) {
            return '0.000000';
        }

        const len = strValue.length;

        if (decimals === 0) {
            return strValue + '.000000';
        }

        if (decimals >= len) {
            // Добавляем нули в начало: например, "123", decimals=5 → "0.00123"
            const padded = '0'.repeat(decimals - len + 1) + strValue;
            const fractionalPart = padded.slice(1); // всё после первой нуля
            const fullFraction = (fractionalPart + '000000').substring(0, 6);
            return `0.${fullFraction}`;
        } else {
            // Разделяем строку на целую и дробную часть
            const integerPart = strValue.slice(0, -decimals);
            const fractionalPart = strValue.slice(-decimals);

            // Дополняем дробную часть до 6 знаков или обрезаем
            const formattedFraction = (fractionalPart + '000000').substring(0, 6);

            return `${integerPart || '0'}.${formattedFraction}`;
        }
    } catch (error) {
        console.error('Error in formatDecimals:', error);
        return '0.000000';
    }
};

export const restoreFromDecimals = (value, decimals)=>{ 
  try {
      let result = Math.floor(value * 10 ** decimals).toLocaleString('fullwide', {useGrouping:false}); // преобразуем к строке
    //  const result = (value/(10 ** decimals )).toLocaleString('fullwide', {useGrouping:false}); // преобразуем к строке
     // console.log(value/(10 ** decimals ))
      return result 
  } catch (error) {
      console.log(error)
      return 0;            
  }
}