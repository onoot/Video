import React, { useState, useMemo } from "react";
import AddNewButton from '../../buttons/AddNew'
import DropdownButton from '../../buttons/DropDown'
import {
  Storage, Dns, Computer, Cloud,
  MonetizationOn, AccountBalance, AttachMoney, SwapHoriz, AccountTree
} from '@mui/icons-material';

// Маппинг имен иконок на компоненты Material Icons
const iconComponents = {
  'storage': Storage,
  'cloud': Cloud,
  'computer': Computer,
  'dns': Dns,
  'monetization': MonetizationOn,
  'account_balance': AccountBalance,
  'attach_money': AttachMoney,
  'swap': SwapHoriz,
  'network': AccountTree
};


const Exchange = ({
  exchanges,
  onEditExchange,
  onAddExchange,
  onDeleteExchange
}) => {

  const getButtons = (item, isDefault) => {
    if (isDefault) {
      return [
        {
          title: "Edit",
          onClick: () => onEditExchange && onEditExchange(item)
        }
      ];
    } else {
      return [
        {
          title: "Edit",
          onClick: () => onEditExchange && onEditExchange(item)
        },
        {
          title: "Delete",
          onClick: () => onDeleteExchange && onDeleteExchange(item.id)
        }
      ];
    }
  };

  const shuffleNetworks = (networks) => {
    if (!networks || !Array.isArray(networks)) return [];
  
    const networksCopy = [...networks];
    
    const bscIndex = networksCopy.findIndex(net => net.icon === "bsc");
    const ethereumIndex = networksCopy.findIndex(net => net.icon === "ethereum");
    
    const bsc = bscIndex !== -1 ? networksCopy.splice(bscIndex, 1)[0] : null;
    const ethereum = ethereumIndex !== -1 ? networksCopy.splice(
      ethereumIndex < bscIndex ? ethereumIndex : ethereumIndex - 1, 1
    )[0] : null;
    
    const shuffledOthers = [...networksCopy].sort(() => Math.random() - 0.5);
    
    const result = [...shuffledOthers];
    if (ethereum) result.push(ethereum);
    if (bsc) result.push(bsc);
    
    return result;
  };

  const NetworkIcon = ({ icon, name, size = 24 }) => {
    const [imageError, setImageError] = useState(false);
    const iconUrl = `/assets/img/${icon}.svg`;

    return (
      <a 
        href="#!" 
        className="avatar avatar-xs rounded-circle" 
        style={{
          border: 'none', 
        }}
      >
        {!imageError ? (
          <img 
            src={iconUrl} 
            alt={name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              border: 'none' 
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <span style={{
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#495057',
            backgroundColor: '#e9ecef', 
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </a>
    );
  };

  // Компонент для отображения логотипа
  const LogoDisplay = ({ exchange }) => {
    const { logo, title, type = 'icon' } = exchange;
    
    // Если тип png и logo содержит .png или .svg
    if (type === 'png' || (logo && (logo.includes('.png') || logo.includes('.svg')))) {
      const logoUrl = logo.startsWith('http') ? logo : `/assets/img/${logo}`;
      
      return (
        <img 
          src={logoUrl} 
          alt={`${title} logo`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <span style="
                font-size: 20px;
                font-weight: bold;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
              ">
                ${title ? title.charAt(0).toUpperCase() : '?'}
              </span>
            `;
          }}
        />
      );
    }
    
    // Если это Material Icon
    if (logo && iconComponents[logo]) {
      const IconComponent = iconComponents[logo];
      return (
        <IconComponent 
          sx={{ 
            fontSize: 40, 
            color: 'white',
            width: '100%',
            height: '100%'
          }} 
        />
      );
    }
    
    // Если это URL изображения
    if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('data:'))) {
      return (
        <img 
          src={logo} 
          alt={`${title} logo`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <span style="
                font-size: 20px;
                font-weight: bold;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
              ">
                ${title ? title.charAt(0).toUpperCase() : '?'}
              </span>
            `;
          }}
        />
      );
    }
    
    // Fallback: отображаем первую букву названия
    return (
      <span style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}>
        {title ? title.charAt(0).toUpperCase() : '?'}
      </span>
    );
  };

  const RenderIcons = ({ exchange }) => {
    const shuffledNetworks = useMemo(() => {
      return shuffleNetworks(exchange.networks);
    }, [exchange.networks]);

    if (!shuffledNetworks || shuffledNetworks.length === 0) {
      return (
        <a 
          href="#!" 
          className="avatar avatar-xs rounded-circle" 
          data-bs-toggle="tooltip" 
          data-original-title="No networks"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#010101ff',
            color: '#000000ff'
          }}
        >
          ∅
        </a>
      );
    }

    return (
      <>
        {shuffledNetworks.map((network, index) => (
          <NetworkIcon 
            key={`${exchange.id}-${network.icon}-${index}`} 
            icon={network.icon} 
            name={network.name} 
          />
        ))}
      </>
    );
  };

  const renderExchange = () => {
    try {
      return exchanges && exchanges.map((exchange, index) => {
        const { title, isDefault, description, dueDate } = exchange;
        const buttons = getButtons(exchange, isDefault);

        return (
          <div key={index} className="col-lg-4 col-md-6 col-sm-6 mb-4 mt-md-0">
            <div className="card">
              <div className="card-body p-3">
                <div className="d-flex mt-n2">
                  <div className="avatar avatar-xl bg-gradient-dark border-radius-xl p-2 mt-n4">
                    <LogoDisplay exchange={exchange} />
                  </div>
                  <div className="ms-3 my-auto">
                    <h6 className="mb-0">{title}</h6>
                    <div className="avatar-group">
                      <RenderIcons exchange={exchange} />
                    </div>
                  </div>
                  <div className="ms-auto">
                    <DropdownButton buttons={buttons} />
                  </div>
                </div>
                <p className="text-sm mt-3">{description}</p>
                <hr className="horizontal dark" />
                <div className="row">
                  <div className="col-6">
                    <h6 className="text-sm mb-0">Custom</h6>
                    <p className="text-secondary text-sm  mb-0">{!isDefault ? 'Yes' : "No"}</p>
                  </div>
                  <div className="col-6 text-end">
                    <h6 className="text-sm mb-0">{dueDate}</h6>
                    <p className="text-secondary text-sm  mb-0">Creation date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  return (
    <section className="py-3 px-md-4">
      <div className="row mb-4 mb-md-0">
        <div className="col-md-8 me-auto my-auto text-left">
          <h5>Exchange</h5>
          <p>Add new or edit</p>
        </div>
        <div className="col-lg-4 col-md-12 my-auto text-end">
          <AddNewButton 
            title={'Add New'} 
            iconName={'add'} 
            onChance={() => onAddExchange()} 
          />
        </div>
      </div>
      <div className="row mt-lg-4 mt-2">
        {renderExchange()}
      </div>
    </section>
  );
};

export default Exchange;