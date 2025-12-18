import React from "react";

const NewButton = ({title, iconName, onChance}) => {

    return (
        <button type="button" 
            className="btn bg-gradient-dark mb-0 mt-0 mt-md-n9 mt-lg-0"
            onClick={()=>onChance()}
            >
                {iconName&&<i className="material-symbols-rounded text-white position-relative text-md pe-2">{iconName}</i>}{title}
            
        </button>
    )
}

export default NewButton;