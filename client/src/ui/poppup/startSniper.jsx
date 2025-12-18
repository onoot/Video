import React, { useState, useEffect } from "react";
import { t } from '../../utils/t18';

const IsStart = (
    {
        onClose,
        setBNBAmount,
        bnbAmount,
        tokenAmount,
        setTokenAmount,
        onStart,
        setActiveTab

    }
) => {
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setTimeout(() => setShow(true), 10);
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

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

    const handleInputChange = (field, value) => {
        if (field === 'bnbAmount') {
            setBNBAmount(value);
        } else if (field === 'tokenAmount') {
            setTokenAmount(value);
        }
        // Очищаем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!bnbAmount || parseFloat(bnbAmount) <= 0) {
            newErrors.bnbAmount = 'Please enter a valid BNB amount';
        }

        if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
            newErrors.tokenAmount = 'Please enter a valid token amount';
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
            onStart()
            setTimeout(() => {
                handleClose()
                setActiveTab({ page: 0, type: 'quick' });
            }, 1000);
        } catch (error) {
            console.error('Error starting sniper:', error);
            setErrors({ submit: 'Failed to start sniper. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                    {t('Main44')}
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
                                {/* Amount Inputs */}
                                <div className="row mb-4">
                                    <div className="mt-3 col-md-6">
                                        <div className={`input-group input-group-static ${bnbAmount && bnbAmount.trim().length > 0 ? 'is-filled' : ''}`}>
                                            <label className="form-label">BNB Amount</label>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.bnbAmount ? 'is-invalid' : ''}`}
                                                value={bnbAmount}
                                                onChange={(e) => handleInputChange('bnbAmount', e.target.value)}
                                                step="0.0001"
                                                min="0.0001"
                                                required
                                            />
                                            {errors.bnbAmount && (
                                                <div className="invalid-feedback d-block">
                                                    {errors.bnbAmount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 col-md-6">
                                        <div className={`input-group input-group-static ${tokenAmount && bnbAmount.trim().length > 0 ? 'is-filled' : ''}`}>
                                            <label className="form-label">Token Amount</label>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.tokenAmount ? 'is-invalid' : ''}`}
                                                value={tokenAmount}
                                                onChange={(e) => handleInputChange('tokenAmount', e.target.value)}
                                                step="0.0001"
                                                min="0.0001"
                                                required
                                            />
                                            {errors.tokenAmount && (
                                                <div className="invalid-feedback d-block">
                                                    {errors.tokenAmount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Slippage Settings */}
                                <div className="mb-4">

                                    <small className="text-muted">
                                        Your transaction will revert if the price changes unfavorably by more than this percentage.
                                    </small>
                                </div>

                                {/* Summary */}
                                <div className="card-body border-radius-lg p-3 text-white" style={{ backgroundImage: `linear-gradient(195deg,#42424a,#191919)` }}>
                                    <h6 className="text-white mb-2">Transaction Summary</h6>
                                    <div className="d-flex justify-content-between text-sm">
                                        <span>BNB Amount:</span>
                                        <span className="font-weight-bold">{bnbAmount || '0'} BNB</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-sm">
                                        <span>Token Amount:</span>
                                        <span className="font-weight-bold">{tokenAmount || '0'} Tokens</span>
                                    </div>
                                </div>

                                {errors.submit && (
                                    <div className="alert alert-danger text-white text-sm" role="alert">
                                        {errors.submit}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn bg-gradient-secondary btn-sm me-2"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-white bg-gradient-primary btn-sm"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Starting...
                                        </>
                                    ) : (
                                        'Start Sniping'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IsStart;