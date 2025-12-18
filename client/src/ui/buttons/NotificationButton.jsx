import React from "react";

const NotificationButton=({data})=>{

  const name = data?.name
  const value = data?.value
  const status = data?.status
    return(
          <button className="border-0 nav-link py-0 px-1 position-relative line-height-0">
            <i className="material-symbols-rounded">
              {name}
            </i>
            <span className="position-absolute top-5 start-100 translate-middle badge rounded-pill bg-danger border border-white small py-1 px-2">
              <span className="small">{value}</span>
              <span className="visually-hidden">{status}</span>
            </span>
          </button>
    )
}

export default NotificationButton;