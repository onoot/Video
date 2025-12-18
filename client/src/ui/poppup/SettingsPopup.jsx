import React, { useState, useEffect, useRef } from "react";
import { t } from '../../utils/t18';
import { Add, Check } from '@mui/icons-material';
import { useStorage } from '../../contex/index';
import ServerSettingsPopup from './dop/ServerSettingsPopup';
import ExchangeSettingsPopup from './dop/ExchangeSettingsPopup';

import {
  Storage, Dns, Computer, Cloud, 
  MonetizationOn, AccountBalance, AttachMoney, SwapHoriz, AccountTree
} from '@mui/icons-material';

const presetIconsServers = [
  { type: 'icon', name: 'storage', label: 'Server', icon: <Storage sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'icon', name: 'cloud', label: 'Cloud', icon: <Cloud sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'icon', name: 'computer', label: 'Home', icon: <Computer sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'icon', name: 'dns', label: 'VPS', icon: <Dns sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'png', name: 'google1', label: 'Google', imageUrl: 'google1.png', className: 'white' },
  { type: 'png', name: 'google3', label: 'Google-2', imageUrl: 'google3.png', className: 'white' },
  { type: 'png', name: 'azure', label: 'Azure', imageUrl: 'azure.svg', className: 'white' },
  { type: 'png', name: 'amazon', label: 'Amazon', imageUrl: 'amazon.svg', className: 'white' },
  { type: 'png', name: 'vercel', label: 'Vercel', imageUrl: 'vercel.svg', className: 'white' },
  { type: 'png', name: '12', label: '12 age', imageUrl: '12.png', className: 'white' }
];

const presetIconsExchange = [
  { type: 'icon', name: 'monetization', label: 'Exchange', icon: <MonetizationOn sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'icon', name: 'account_balance', label: 'Balance', icon: <AccountBalance sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'icon', name: 'attach_money', label: 'Money', icon: <AttachMoney sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'icon', name: 'swap', label: 'Swap', icon: <SwapHoriz sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'icon', name: 'network', label: 'Network', icon: <AccountTree sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
  { type: 'png', name: 'pancake', label: 'Pancake', imageUrl: 'pancake.svg', className: 'white' },
  { type: 'png', name: 'uniswap', label: 'Uniswap', imageUrl: 'uni.svg', className: 'white' },
  { type: 'png', name: 'shibaswap', label: 'ShibaSwap', imageUrl: 'shiba.svg', className: 'white' },
  { type: 'png', name: 'sushiswap', label: 'SushiSwap', imageUrl: 'sushi.svg', className: 'white' },
  { type: 'png', name: 'quickswap', label: 'QuickSwap', imageUrl: 'quick.svg', className: 'white' },
];

const validateAndFixUrl = (url, fieldName) => {
  if (!url || !url.trim()) return { value: url, error: null };

  const trimmedUrl = url.trim();

  try {
    if (/^[a-zA-Z]+:\/\//.test(trimmedUrl)) {
      const urlObj = new URL(trimmedUrl);
      if (fieldName === 'wss' && !urlObj.protocol.startsWith('wss')) {
        return {
          value: trimmedUrl,
          error: `WSS URL must use wss:// protocol`
        };
      }
      return { value: trimmedUrl, error: null };
    } else {
      let fixedUrl = trimmedUrl;
      
      if (fieldName === 'wss') {
        if (!trimmedUrl.startsWith('wss://')) {
          fixedUrl = `wss://${trimmedUrl}`;
        }
      } else if (fieldName === 'rpc') {
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          fixedUrl = `https://${trimmedUrl}`;
        }
      }

      try {
        new URL(fixedUrl);
        return { value: fixedUrl, error: null };
      } catch (error) {
        return {
          value: trimmedUrl,
          error: `Invalid ${fieldName} URL format`
        };
      }
    }
  } catch (error) {
    return {
      value: trimmedUrl,
      error: `Invalid ${fieldName} URL format`
    };
  }
};

const validateRouterAddress = (address) => {
  if (!address || !address.trim()) return { value: address, error: null };

  const trimmedAddress = address.trim();
  const isValidAddress = /^(0x[a-fA-F0-9]{40})$/.test(trimmedAddress);

  if (!isValidAddress) {
    return {
      value: trimmedAddress,
      error: 'Invalid router address format. Must be 0x followed by 40 hex characters'
    };
  }

  return { value: trimmedAddress, error: null };
};

const SettingsPopup = ({
  onClose,
  initialData = {},
  onSubmit,
  onDelete,
  submitText = "Save",
  workOnServer = true,
  action = 'add'
}) => {
  console.log('SettingsPopup - action:', action);
  console.log('SettingsPopup - initialData:', initialData);
  console.log('SettingsPopup - initialData.id:', initialData?.id);

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('storage');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const fileInputRef = useRef(null);

  const [focusedFields, setFocusedFields] = useState({
    title: false,
    description: false,
    domain: false,
    port: false,
    username: false,
    password: false,
    address: false,
    privat: false,
    routerV2: false
  });

  const getPresetIconData = (logo) => {
    if (!logo) return null;
    
    if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('data:')) {
      return {
        type: 'custom',
        name: 'custom_url',
        label: 'Custom Logo',
        imageUrl: logo,
        className: 'white'
      };
    }
    
    const presetIcons = workOnServer ? presetIconsServers : presetIconsExchange;
    const foundPreset = presetIcons.find(icon => {
      if (icon.name === logo) return true;
      if (icon.type === 'png' && icon.imageUrl === logo) return true;
      return false;
    });
    
    if (foundPreset) return foundPreset;
    
    return null;
  };

  useEffect(() => {
    setTimeout(() => setShow(true), 10);
    document.body.style.overflow = 'hidden';

    const logoData = initialData.logo || '';
    const presetData = getPresetIconData(logoData);
    const defaultLogo = workOnServer ? 'storage' : 'monetization';
    
    let initialLogoValue = '';
    let initialSelectedPreset = defaultLogo;
    let initialLogoType = 'icon';
    
    if (presetData) {
      initialSelectedPreset = presetData.name;
      initialLogoType = presetData.type;
      
      if (presetData.type === 'icon') {
        initialLogoValue = presetData.name;
      } else if (presetData.type === 'png') {
        initialLogoValue = presetData.imageUrl;
      } else {
        initialLogoValue = presetData.imageUrl || logoData;
      }
    } else if (logoData && (logoData.startsWith('http://') || logoData.startsWith('https://') || logoData.startsWith('data:'))) {
      initialSelectedPreset = 'custom_url';
      initialLogoValue = logoData;
      setLogoPreview(logoData);
    } else {
      if (logoData && (logoData.includes('.png') || logoData.includes('.svg') || logoData.includes('.jpg') || logoData.includes('.jpeg'))) {
        initialLogoType = 'png';
        initialLogoValue = logoData;
      }
    }

    const initialFormData = workOnServer ? {
      title: initialData.title || '',
      description: initialData.description || '',
      domain: initialData.domain || '',
      port: initialData.port || '',
      username: initialData.username || '',
      password: initialData.password || '',
      address: initialData.address || '',
      privat: initialData.privat || '',
      logo: initialLogoValue,
      logoType: initialLogoType,
      isDefault: initialData.isDefault || false,
      id: initialData.id || '' // СОХРАНЯЕМ ID
    } : {
      title: initialData.title || '',
      description: initialData.description || '',
      url: {
        rpc: initialData.url?.rpc || '',
        wss: initialData.url?.wss || ''
      },
      isDefault: initialData.isDefault || false,
      networks: initialData.networks || [],
      routerV2: initialData.routerV2 || '',
      logo: initialLogoValue,
      logoType: initialLogoType,
      type: initialData.type || initialLogoType,
      id: initialData.id || '', // СОХРАНЯЕМ ID
      isCustom: initialData.isCustom !== undefined ? initialData.isCustom : true
    };

    console.log('SettingsPopup - initialFormData:', initialFormData);
    
    setFormData(initialFormData);
    setSelectedPreset(initialSelectedPreset);
    setNetworks(initialData.networks || []);

    return () => {
      document.body.style.overflow = 'unset';
      if (logoPreview && logoPreview.startsWith('data:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [initialData, workOnServer]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFocusedFields(prev => ({ ...prev, [fieldName]: false }));

    if (fieldName === 'routerV2') {
      const validation = validateRouterAddress(formData[fieldName]);
      if (validation.error) {
        setErrors(prev => ({ ...prev, [fieldName]: validation.error }));
      }
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleUrlChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      url: {
        ...prev.url,
        [field]: value
      }
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleUrlBlur = (field) => {
    setFocusedFields(prev => ({
      ...prev,
      url: { ...prev.url, [field]: false }
    }));

    const value = formData.url?.[field];
    if (value && value.trim()) {
      const validation = validateAndFixUrl(value, field);
      if (validation.error) {
        setErrors(prev => ({ ...prev, [field]: validation.error }));
      } else if (validation.value !== value) {
        handleUrlChange(field, validation.value);
      }
    }
  };

  const handlePresetSelect = (iconObject) => {
    setSelectedPreset(iconObject.name);
    
    if (iconObject.name !== 'uploaded' && iconObject.name !== 'custom_url') {
      setLogoPreview('');
    }
    
    let logoType = iconObject.type || 'icon';
    let logoValue;
    
    if (iconObject.type === 'icon') {
      logoValue = iconObject.name;
    } else if (iconObject.type === 'png' || iconObject.type === 'custom') {
      logoValue = iconObject.imageUrl;
    } else {
      logoValue = iconObject.name;
    }
    
    setFormData(prev => ({
      ...prev,
      logo: logoValue,
      logoType: logoType,
      type: !workOnServer ? logoType : prev.type
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please select an image file' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'File size should be less than 5MB' }));
        return;
      }

      if (logoPreview && logoPreview.startsWith('data:')) {
        URL.revokeObjectURL(logoPreview);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setLogoPreview(dataUrl);
        setUploadedFile(file);
        setSelectedPreset('uploaded');
        
        setFormData(prev => ({
          ...prev,
          logo: dataUrl,
          logoType: 'custom',
          type: !workOnServer ? 'custom' : prev.type
        }));
      };
      reader.readAsDataURL(file);

      if (errors.logo) {
        setErrors(prev => ({ ...prev, logo: '' }));
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!workOnServer) {
      if (formData.url?.rpc?.trim()) {
        const rpcValidation = validateAndFixUrl(formData.url.rpc, 'rpc');
        if (rpcValidation.error) {
          newErrors.rpc = rpcValidation.error;
        }
      }

      if (formData.url?.wss?.trim()) {
        const wssValidation = validateAndFixUrl(formData.url.wss, 'wss');
        if (wssValidation.error) {
          newErrors.wss = wssValidation.error;
        }
      }

      if (formData.routerV2?.trim()) {
        const routerValidation = validateRouterAddress(formData.routerV2);
        if (routerValidation.error) {
          newErrors.routerV2 = routerValidation.error;
        }
      }
    }

    if (workOnServer) {
      if (!formData.domain?.trim()) {
        newErrors.domain = 'Domain or IP is required';
      }
      if (!formData.port) {
        newErrors.port = 'Port is required';
      }
      if (!formData.username?.trim()) {
        newErrors.username = 'Login is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let processedFormData = { ...formData };

      if (!workOnServer) {
        processedFormData = {
          ...processedFormData,
          url: {
            rpc: formData.url?.rpc ? validateAndFixUrl(formData.url.rpc, 'rpc').value : '',
            wss: formData.url?.wss ? validateAndFixUrl(formData.url.wss, 'wss').value : ''
          },
          routerV2: formData.routerV2 ? validateRouterAddress(formData.routerV2).value : '',
          networks: networks,
          type: formData.type || formData.logoType || 'icon'
        };
      }

      // СОЗДАЕМ submitData С УЧЕТОМ ВСЕХ ПОЛЕЙ
      const submitData = workOnServer
        ? {
            ...processedFormData,
            id: formData.id || initialData.id || '' // ПЕРЕДАЕМ ID В submitData
          }
        : {
            ...processedFormData,
            networks: networks,
            isCustom: processedFormData.isCustom !== undefined ? processedFormData.isCustom : true,
            logo: processedFormData.logo,
            type: processedFormData.type || processedFormData.logoType || 'icon',
            id: formData.id || initialData.id || '' // ПЕРЕДАЕМ ID В submitData
          };

      console.log('SettingsPopup - submitData:', submitData);
      console.log('SettingsPopup - submitData.id:', submitData.id);
      console.log('SettingsPopup - action:', action);

      await onSubmit(submitData, action);
      handleClose();
    } catch (error) {
      console.error('Error saving:', error);
      setErrors({ submit: error.message || 'Failed to save. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    const itemType = workOnServer ? 'server' : 'exchange';
    if (onDelete && window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      onDelete();
      handleClose();
    }
  };

  const renderInputField = (fieldName, label, type = 'text', required = true) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];
    const isFilled = value && value.toString().trim().length > 0;

    return (
      <div className="col-12 col-sm-6">
        <div className={`input-group input-group-dynamic ${isFilled ? 'is-filled' : ''} ${focusedFields[fieldName] ? 'focused' : ''}`}>
          <label className="form-label">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
          <input
            type={type}
            className={`form-control ${error ? 'is-invalid' : ''}`}
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            onFocus={() => handleFocus(fieldName)}
            onBlur={() => handleBlur(fieldName)}
            required={required}
          />
          {error && (
            <div className="invalid-feedback d-block">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  };

  const serverSettings = workOnServer ? ServerSettingsPopup({
    initialData,
    formData,
    errors,
    focusedFields,
    onInputChange: handleInputChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    selectedPreset,
    logoPreview,
    uploadedFile,
    onPresetSelect: handlePresetSelect,
    onFileUpload: handleFileUpload,
    fileInputRef,
    onUploadClick: handleUploadClick
  }) : null;

  const exchangeSettings = !workOnServer ? ExchangeSettingsPopup({
    initialData,
    formData,
    errors,
    focusedFields,
    onInputChange: handleInputChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onUrlChange: handleUrlChange,
    onUrlBlur: handleUrlBlur,
    selectedPreset,
    logoPreview,
    uploadedFile,
    onPresetSelect: handlePresetSelect,
    onFileUpload: handleFileUpload,
    fileInputRef,
    onUploadClick: handleUploadClick,
    networks,
    setNetworks,
    selectedNetwork,
    setSelectedNetwork,
    validateRouterAddress
  }) : null;

  return (
    <div
      className={`modal-backdrop-fade ${show ? 'show' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1040,
        display: 'block'
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{
          display: 'block',
          opacity: show ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        tabIndex="-1"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            transform: show ? 'scale(1)' : 'scale(0.7)',
            opacity: show ? 1 : 0,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <div className="modal-content">
            <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
              <div className="bg-gradient-dark shadow-dark border-radius-lg py-3 pe-1">
                <h4 className="text-white font-weight-bolder text-center mt-2">
                  {workOnServer ? 'Server Settings' : 'Exchange Settings'}
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2"
                  onClick={handleClose}
                  aria-label="Close"
                ></button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="card-body">
                {initialData.id&&workOnServer && (
                  <div className="multisteps-form__content mt-3">
                    <div className="card bg-gradient-white border-radius-lg p-3">
                      <h6 className="mb-2">{workOnServer ? 'Server Information' : 'Exchange Information'}</h6>
                      <div className="d-flex justify-content-between text-sm mb-1">
                        <span>ID:</span>
                        <span className="font-weight-bold">{initialData.id}</span>
                      </div>
                      {workOnServer && initialData.status && (
                        <div className="d-flex justify-content-between text-sm">
                          <span>Status:</span>
                          <span className={`font-weight-bold ${initialData.status === 'online' ? 'text-success' : 'text-danger'}`}>
                            {initialData.status}
                          </span>
                        </div>
                      )}
                      {initialData.lastSeen && (
                        <div className="d-flex justify-content-between text-sm mt-1">
                          <span>Last Updated:</span>
                          <span className="font-weight-bold">
                            {new Date(initialData.lastSeen).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {!workOnServer && initialData.type && (
                        <div className="d-flex justify-content-between text-sm mt-1">
                          <span>Type:</span>
                          <span className="font-weight-bold">
                            {initialData.type.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between text-sm mt-1">
                        <span>Action:</span>
                        <span className="font-weight-bold">
                          {action.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Иконки */}
                {workOnServer 
                  ? serverSettings?.renderIconField?.()
                  : exchangeSettings?.renderIconField?.()
                }

                <div className="multisteps-form__content mt-3">
                  <div className="row">
                    {renderInputField('title', workOnServer ? 'Server Name' : 'Exchange Name')}
                    {renderInputField('description', 'Description', 'text', false)}
                  </div>
                </div>

                {/* Специфичные поля */}
                {workOnServer 
                  ? serverSettings?.renderServerFields?.()
                  : exchangeSettings?.renderExchangeFields?.()
                }

                {errors.submit && (
                  <div className="multisteps-form__content mt-3">
                    <div className="alert alert-danger text-white text-sm" role="alert">
                      {errors.submit}
                    </div>
                  </div>
                )}

                <div className="multisteps-form__content mt-4">
                  <div className="button-row d-flex justify-content-between align-items-center">
                    {(!initialData?.isDefault || initialData?.isCustom) && (
                      <div>
                        {initialData.id && !initialData.isCustom && (
                          <button
                            type="button"
                            className="btn bg-gradient-danger me-2 mb-0"
                            onClick={handleDeleteClick}
                            disabled={isSubmitting}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                    <div className="d-flex gap-2 ms-auto">
                      <button
                        type="button"
                        className="btn bg-gradient-secondary mb-0"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn bg-gradient-dark mb-0"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving...
                          </>
                        ) : (
                          submitText
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;