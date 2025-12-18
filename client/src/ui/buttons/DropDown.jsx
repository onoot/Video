import React, { useState, useRef, useEffect } from "react";

const DropDown = ({ buttons }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = (onClick) => {
        onClick();
        setIsOpen(false); 
    };

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button 
                className="btn btn-link text-secondary ps-0 pe-2" 
                id="navbarDropdownMenuLink"
                onClick={toggleDropdown}
                aria-haspopup="true" 
                aria-expanded={isOpen}
            >
                <i className="fa fa-ellipsis-v text-lg" />
            </button>
            <div 
                className={`dropdown-menu dropdown-menu-end me-sm-n4 me-n3 ${isOpen ? 'show' : ''}`}
                aria-labelledby="navbarDropdownMenuLink"
            >
                {buttons && buttons.map((button, index) => {
                    return (
                        <a 
                            key={index}
                            className="dropdown-item" 
                            onClick={() => handleItemClick(button.onClick)}
                            style={{ cursor: 'pointer' }}
                        >
                            {button.title}
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

export default DropDown;