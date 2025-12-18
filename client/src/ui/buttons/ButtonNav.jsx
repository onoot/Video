import React from "react";

const ButtonNav=({name, isActive, onChange})=>{

    return(
     <button className="border-0 px-1 py-0 nav-link line-height-0" onClick={()=>onChange()}>
            <i className="material-symbols-rounded">
              {name}
            </i>
          </button>
    )
}

export default ButtonNav;