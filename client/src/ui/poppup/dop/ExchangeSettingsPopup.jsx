import React, { useState, useEffect } from "react";
import { MonetizationOn, AccountBalance, AttachMoney, SwapHoriz, AccountTree, Add, Check } from '@mui/icons-material';
import CustomDropdown from '../../buttons/DropdownForDetails';

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

const presetNetworks = [
    { name: 'Ethereum', icon: 'ethereum'},
    { name: 'Binance Smart Chain', icon: 'bsc' },
    { name: 'Polygon', icon: 'polygon' },
    { name: 'Arbitrum', icon: 'arbitrum' },
    { name: 'Optimism', icon: 'optimism' },
    { name: 'Avalanche', icon: 'avalanche' },
    { name: 'Fantom', icon: 'fantom'},
];

const ExchangeSettingsPopup = ({
    initialData = {},
    formData,
    errors,
    focusedFields,
    onInputChange,
    onFocus,
    onBlur,
    onUrlChange,
    onUrlBlur,
    selectedPreset,
    logoPreview,
    uploadedFile,
    onPresetSelect,
    onFileUpload,
    fileInputRef,
    onUploadClick,
    networks,
    setNetworks,
    selectedNetwork,
    setSelectedNetwork,
    validateRouterAddress
}) => {
    const allIcons = [
        ...presetIconsExchange,
        ...(uploadedFile ? [{
            type: 'custom',
            name: 'uploaded',
            label: uploadedFile.name,
            imageUrl: logoPreview,
            className: 'white',
            file: uploadedFile
        }] : [])
    ];

    const selected = allIcons.find(p => p.name === selectedPreset);

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
                        onChange={(e) => onInputChange(fieldName, e.target.value)}
                        onFocus={() => onFocus(fieldName)}
                        onBlur={() => onBlur(fieldName)}
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

    const renderUrlField = (field, label, type = 'text', required = false) => {
        const value = formData.url?.[field] || '';
        const error = errors[field];
        const isFilled = value && value.toString().trim().length > 0;

        return (
            <div className="col-12 col-sm-6">
                <div className={`input-group input-group-dynamic ${isFilled ? 'is-filled' : ''} ${focusedFields.url?.[field] ? 'focused' : ''}`}>
                    <label className="form-label">
                        {label}
                        {required && <span className="text-danger"> *</span>}
                    </label>
                    <input
                        type={type}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onUrlChange(field, e.target.value)}
                        onFocus={() => onFocus(`url.${field}`)}
                        onBlur={() => onUrlBlur(field)}
                        required={required}
                    />
                    {error && (
                        <div className="invalid-feedback d-block">
                            {error}
                        </div>
                    )}
                    {!error && value && (
                        <small className="text-success text-sm mt-1">
                            ✓ Valid URL format
                        </small>
                    )}
                </div>
            </div>
        );
    };

    const addNetwork = () => {
        if (selectedNetwork) {
            const networkToAdd = presetNetworks.find(net => net.icon === selectedNetwork);
            if (networkToAdd && !networks.find(net => net.icon === selectedNetwork)) {
                const newNetwork = {
                    ...networkToAdd,
                    rpcUrl: '',
                    wssUrl: ''
                };
                setNetworks(prev => [...prev, newNetwork]);
                setSelectedNetwork('');
            }
        }
    };

    const removeNetwork = (index) => {
        setNetworks(prev => prev.filter((_, i) => i !== index));
    };

    const renderNetworkManagement = () => {
        const existingNetworkIcons = networks.map(net => net.icon);
        const availableNetworks = presetNetworks.filter(network => !existingNetworkIcons.includes(network.icon));

        return (
            <div className="multisteps-form__content mt-3">
                <div className="row">
                    <div className="col-12">
                        <label className="form-label">
                            <h6>Supported EVM Networks</h6>
                            <small className="text-muted">
                                Our bot works only with pre-configured EVM networks
                            </small>
                        </label>

                        <div className="row d-flex mb-3 align-items-baseline justify-content-between">
                            <div className={`col-12 ${availableNetworks.length > 0 ? 'col-sm-8' : 'col-sm-10'}`}>
                                {availableNetworks.length > 0 ? (
                                    <CustomDropdown
                                        options={[
                                            { value: '', label: 'Select Network' },
                                            ...availableNetworks.map(network => ({
                                                value: network.icon,
                                                label: network.name,
                                                icon: network.icon
                                            }))
                                        ]}
                                        value={selectedNetwork}
                                        onChange={setSelectedNetwork}
                                        showIcons={true}
                                    />
                                ) : (
                                    <div className="form-control" style={{
                                        backgroundColor: '#f8f9fa',
                                        borderColor: '#dee2e6',
                                        color: '#6c757d',
                                        cursor: 'not-allowed',
                                        opacity: 0.7
                                    }}>
                                        All networks added
                                    </div>
                                )}
                            </div>
                            <div className={`col-12 ms-auto mb-0 ${availableNetworks.length > 0 ? ' col-sm-3' : ' col-sm-2'}`}>
                                <button
                                    type="button"
                                    className="btn bg-gradient-dark btn-sm d-flex align-items-center justify-content-center gap-2 w-100"
                                    onClick={addNetwork}
                                    disabled={!selectedNetwork || availableNetworks.length === 0}
                                >
                                    {availableNetworks.length > 0 ? <Add sx={{ fontSize: 18 }} /> : <Check sx={{ fontSize: 18 }} />}
                                    {availableNetworks.length === 0 ? '' : 'Add'}
                                </button>
                            </div>
                        </div>

                        <div className="networks-list">
                            {networks.map((network, index) => {
                                return (
                                    <div key={index} className="card mb-2">
                                        <div className="card-body py-0">
                                            <div className="row align-items-center">
                                                <div className="col-8">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div style={{
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#e9ecef',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <img
                                                                src={`/assets/img/${network.icon}.svg`}
                                                                alt={network.name}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'contain',
                                                                    padding: '2px'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.textContent = network.icon.charAt(0).toUpperCase();
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="fw-bold">{network.name}</span>
                                                        <span className="badge bg-primary">EVM</span>
                                                    </div>
                                                </div>
                                                <div className="col-4 d-flex justify-content-end p-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm mt-auto mb-auto"
                                                        onClick={() => removeNetwork(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {networks.length === 0 && (
                                <div className="text-center text-muted py-3">
                                    <AccountTree sx={{ fontSize: 40}} />
                                    <p className="mt-2">No networks added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderIconField = () => {
        return (
            <div className="multisteps-form__content mt-3">
                <div className="row">
                    <div className="col-12">
                        <label className="form-label">
                            <h6>Exchange Icon</h6>
                        </label>

                        <div className="mb-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <small className="text-muted d-block mt-1">
                                Choose an image to make your exchange easier to recognize.
                                <br />
                                Skip for now, and we'll set one for you automatically.
                                <br />
                                Supported formats: JPG, PNG, SVG.
                            </small>
                        </div>

                        <div className="row mt-3">
                            {allIcons.map((icon) => (
                                <div className="col-auto mb-2" key={icon.name}>
                                    <button
                                        type="button"
                                        className={`btn ${selectedPreset === icon.name ? 'bg-gradient-dark' : 'btn-outline-dark'} btn-sm d-flex align-items-center gap-2`}
                                        onClick={() => {
                                            const iconData = {
                                                ...icon,
                                                value: icon.type === 'icon' ? icon.name : icon.imageUrl
                                            };
                                            onPresetSelect(iconData);
                                        }}
                                    >
                                        {icon.type === 'icon' ? (
                                            React.cloneElement(icon.icon, { sx: { fontSize: 20 } })
                                        ) : (
                                            <img
                                                src={`/assets/img/${icon.imageUrl}`}
                                                alt={icon.label}
                                                style={{ width: 20, height: 20, objectFit: 'contain' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = `
                                                        <span style="
                                                            font-size: 12px;
                                                            font-weight: bold;
                                                            color: #000;
                                                            display: flex;
                                                            align-items: center;
                                                            justify-content: center;
                                                            width: 20px;
                                                            height: 20px;
                                                        ">
                                                            ${icon.label.charAt(0).toUpperCase()}
                                                        </span>
                                                    `;
                                                }}
                                            />
                                        )}
                                        <span className="d-none d-sm-inline">{icon.label}</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {errors.logo && (
                            <div className="text-danger text-sm mt-1">
                                {errors.logo}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderExchangeFields = () => {
        return (
            <>
                <div className="multisteps-form__content mt-3">
                    <div className="row">
                        {renderUrlField('rpc', 'RPC URL', 'text', false)}
                        {renderUrlField('wss', 'WebSocket URL (WSS)', 'text', false)}
                    </div>
                </div>

                <div className="multisteps-form__content mt-3 col-12 col-sm-12 col-md-12">
                    {renderInputField('routerV2', 'Router V2 Address', 'text', false)}
                </div>

                {renderNetworkManagement()}
            </>
        );
    };

    return {
        renderIconField,
        renderExchangeFields,
        renderNetworkManagement
    };
};

export default ExchangeSettingsPopup;