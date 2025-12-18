import React, { useState, useEffect } from "react";

const NavMenu = ({ array, activePath, activeTab: externalActiveTab, onTabChange }) => {
    const isControlled = externalActiveTab !== undefined;
    const findActiveTabByPath = () => {
        if (activePath && array) {
            const foundIndex = array.findIndex(tab => tab.path === activePath);
            return foundIndex !== -1 ? foundIndex : 0;
        }
        return 0;
    };

    const [internalActiveTab, setInternalActiveTab] = useState(findActiveTabByPath());
    const activeTab = isControlled ? externalActiveTab : internalActiveTab;

    useEffect(() => {
        if (activePath) {
            const newActiveTab = findActiveTabByPath();
            if (isControlled) {
                onTabChange?.(newActiveTab);
            } else {
                setInternalActiveTab(newActiveTab);
            }
        }
    }, [activePath, array]);

    const handleTabClick = (index, changeFunction) => {
        if (!isControlled) {
            setInternalActiveTab(index);
        } else {
            onTabChange?.(index);
        }
        
        if (changeFunction) {
            changeFunction();
        }
    };

    const renderTabs = () => {
        try {
            if (!array || !Array.isArray(array) || array.length <= 0) {
                console.log('array empty');
                return null;
            }
            
            return array.map((tab, index) => {
                const name = tab?.name;
                const title = tab?.title;
                const change = tab?.change;
                const isActive = activeTab === index;

                return (
                    <li key={index} className="nav-item" role="presentation">
                        <a
                            className={`nav-link mb-0 px-0 py-1 ${isActive ? 'active' : ''}`}
                            onClick={() => handleTabClick(index, change)}
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="material-symbols-rounded text-lg position-relative">{name}</i>
                            <span className="ms-1">{title}</span>
                        </a>
                    </li>
                );
            });
        } catch (e) {
            console.log(e);
            return null;
        }
    };

    return (
        <div className="col-lg-4 col-md-6 my-sm-auto ms-sm-auto me-sm-0 mx-auto mt-3 none_select">
            <div className="nav-wrapper position-relative end-0">
                <ul className="nav nav-pills nav-fill p-1" role="tablist">
                    {renderTabs()}
                    <div 
                        className="moving-tab position-absolute nav-link" 
                        style={{
                            padding: 0, 
                            transition: '0.5s', 
                            transform: `translate3d(${activeTab * 95}%, 0, 0)`,
                            width: `${100 / array.length}%`
                        }}
                        aria-selected="false" 
                        tabIndex={-1} 
                        role="tab"
                    >
                        <a className="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#!" role="tab" aria-selected="true">-</a>
                    </div>
                </ul>
            </div>
        </div>
    );
};

export default NavMenu;