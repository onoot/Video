//client\src\ui\buttons\DropdownForDetails.jsx
import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({
  options,
  value,
  onChange,
  name = "choices-sizes",
  id = "choices-currency",
  disabled,
  placeholder,
  autoSelectFirst = false,
  openUpward = false,
  showIcons = false,
  iconBasePath = '/assets/img/'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (autoSelectFirst && !value && options.length > 0 && onChange) {
      onChange(options[0].value);
    }
  }, [autoSelectFirst, value, options, onChange]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (openUpward || rect.bottom + 200 > viewportHeight) {
        setDropdownStyle({
          bottom: '100%',
          top: 'auto',
          marginBottom: '4px'
        });
      } else {
        setDropdownStyle({
          top: '100%',
          bottom: 'auto',
          marginTop: '4px'
        });
      }
    }
  }, [isOpen, openUpward]);

  const selectedOption = options.find(opt => opt.value === value) ||
    (options.length > 0 ? options[0] : null);

  const displayLabel = selectedOption ? (
    showIcons ? (
      <div className="d-flex align-items-center gap-2">
        {selectedOption.icon && (
          <img
            src={`${iconBasePath}${selectedOption.icon}.svg`}
            alt=""
            style={{ width: 20, height: 20 }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <span>{selectedOption.label}</span>
      </div>
    ) : selectedOption.label
  ) : placeholder ? (
    <span className="text-muted">{placeholder}</span>
  ) : options.length > 0 ? options[0].label : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleSelect = (option) => {
    if (!disabled && onChange) {
      onChange(option.value);
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  return (
    <div className="input-group input-group-dynamic" ref={containerRef}>

      <div
        ref={dropdownRef}
        className={`choices ${isFocused ? 'is-focused' : ''} ${disabled ? 'is-disabled' : ''}`}
        data-type="select-one"
        tabIndex={disabled ? -1 : 0}
        role="listbox"
        onKeyDown={handleKeyDown}
        style={{ userSelect: 'none', ...(disabled ? { opacity: 0.6, pointerEvents: 'none' } : {}) }}
      >
        <div className="choices__inner">
          <select
            className="form-control choices__input"
            name={name}
            id={id}
            hidden
            tabIndex={-1}
            data-choice="active"
            value={value || ''}
            onChange={(e) => !disabled && onChange && onChange(e.target.value)}
            disabled={disabled}
          >
            {placeholder && !value && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={disabled}>
                {typeof option.label === 'string' ? option.label : 'Option'}
              </option>
            ))}
          </select>

          <div className="choices__list choices__list--single">
            <div
              className={`choices__item choices__item--selectable ${!selectedOption ? 'choices__item--placeholder' : ''}`}
              data-item
              data-id={selectedOption?.value || ''}
              data-value={selectedOption?.value || ''}
              data-custom-properties="null"
              aria-selected="true"
              onClick={handleToggle}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              {displayLabel}
            </div>
          </div>
        </div>

        {isOpen && !disabled && (
          <div
            className="choices__list choices__list--dropdown is-active"
            aria-expanded="false"
            style={{
              position: 'absolute',
              width: '100%',
              zIndex: 1000,
              ...dropdownStyle
            }}
          >
            <div className="choices__list" role="listbox">
              {options.map((option, index) => (
                <div
                  key={option.value}
                  id={`${id}-item-${option.value}`}
                  className={`choices__item choices__item--choice ${option.value === value ? 'is-selected' : ''
                    } choices__item--selectable ${index === 0 ? 'is-highlighted' : ''
                    }`}
                  role="option"
                  data-choice
                  data-id={index + 1}
                  data-value={option.value}
                  data-select-text="Press to select"
                  data-choice-selectable
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px'
                  }}
                >
                  {showIcons && option.icon && (
                    <img
                      src={`${iconBasePath}${option.icon}.svg`}
                      alt=""
                      style={{ width: 20, height: 20 }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;