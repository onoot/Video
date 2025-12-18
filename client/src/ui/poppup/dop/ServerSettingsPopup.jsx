import React, { useState, useEffect, useRef } from "react";
import { Storage, Computer, Cloud, Dns, Add } from '@mui/icons-material';
import CustomDropdown from '../../buttons/DropdownForDetails';

const presetIconsServers = [
    { type: 'icon', name: 'storage', label: 'Server', icon: <Storage sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
    { type: 'icon', name: 'cloud', label: 'Cloud', icon: <Cloud sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
    { type: 'icon', name: 'computer', label: 'Home', icon: <Computer sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
    { type: 'icon', name: 'dns', label: 'VPS', icon: <Dns sx={{ fontSize: 40, color: 'black' }} />, className: "white" },
    { type: 'png', name: 'google1', label: 'Google', imageUrl: '../../assets/img/google1.png', className: 'white' },
    { type: 'png', name: 'google3', label: 'Google-2', imageUrl: '../../assets/img/google3.png', className: 'white' },
    { type: 'png', name: 'azure', label: 'Azure', imageUrl: '../../assets/img/azure.svg', className: 'white' },
    { type: 'png', name: 'amazon', label: 'Amazon', imageUrl: '../../assets/img/amazon.svg', className: 'white' },
    { type: 'png', name: 'vercel', label: 'Vercel', imageUrl: '../../assets/img/vercel.svg', className: 'white' },
    { type: 'png', name: '12', label: '12 age', imageUrl: '../../assets/img/12.png', className: 'white' }
];

const ServerSettingsPopup = ({
    initialData = {},
    formData,
    errors,
    focusedFields,
    onInputChange,
    onFocus,
    onBlur,
    selectedPreset,
    logoPreview,
    uploadedFile,
    onPresetSelect,
    onFileUpload,
    fileInputRef,
    onUploadClick
}) => {
    const allIcons = [
        ...presetIconsServers,
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

    const renderIconField = () => {
        return (
            <div className="multisteps-form__content mt-3">
                <div className="row">
                    <div className="col-12">
                        <label className="form-label">
                            <h6>Server Icon</h6>
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
                                Choose an image to make your server easier to recognize.
                                <br />
                                Skip for now, and we'll set one for you automatically.
                                <br />
                                Supported formats: JPG, PNG, SVG.
                            </small>
                        </div>

                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="flex-grow-1">
                                <CustomDropdown
                                    options={[
                                        {
                                            value: 'upload',
                                            label: (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Add sx={{ fontSize: 20 }} />
                                                    Upload Custom Image
                                                </span>
                                            )
                                        },
                                        ...allIcons.map(p => ({
                                            value: p.name,
                                            label: (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {p.type === 'icon' ? (
                                                        React.cloneElement(p.icon, { sx: { width: 24, height: 24 } })
                                                    ) : (
                                                        <img 
                                                            src={p.imageUrl} 
                                                            alt={p.label} 
                                                            style={{ width: 24, height: 24, objectFit: 'contain' }} 
                                                        />
                                                    )}
                                                    {p.label}
                                                </span>
                                            )
                                        }))
                                    ]}
                                    value={selectedPreset}
                                    onChange={(value) => {
                                        if (value === 'upload') {
                                            onUploadClick();
                                        } else {
                                            const preset = allIcons.find(icon => icon.name === value);
                                            // Передаем объект иконки целиком
                                            onPresetSelect(value, preset);
                                        }
                                    }}
                                    name="icon-preset"
                                    id="icon-preset"
                                    autoSelectFirst={false}
                                />
                            </div>
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

    const renderServerFields = () => {
        return (
            <>
                <div className="multisteps-form__content mt-3">
                    <div className="row">
                        {renderInputField('domain', 'Domain or IP Address')}
                        {renderInputField('port', 'Port', 'number')}
                    </div>
                </div>

                <div className="multisteps-form__content mt-3">
                    <div className="row">
                        {renderInputField('username', 'Login')}
                        {renderInputField('password', 'Password', 'password')}
                    </div>
                </div>

                <div className="multisteps-form__content mt-3">
                    <div className="row">
                        {renderInputField('address', 'Address', 'text', false)}
                        {renderInputField('privat', 'Private Key', 'text', false)}
                    </div>
                </div>
            </>
        );
    };

    return {
        renderIconField,
        renderServerFields
    };
};

export default ServerSettingsPopup;