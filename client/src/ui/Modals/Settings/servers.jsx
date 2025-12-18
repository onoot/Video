import React from "react";
import AddNewButton from '../../buttons/AddNew'
import DropdownButton from '../../buttons/DropDown'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import { Storage, Dns, Computer, Cloud } from '@mui/icons-material';

const Servers = ({
    serverList,
    activeServerId,
    setActiveServerId,
    onEditServer,
    onAddServer,
    onDeleteServer,
}) => {

    const getButtons = (item, isDefault) => {
        if (isDefault) {
            return [
                {
                    title: "Edit",
                    onClick: () => onEditServer && onEditServer(item)
                },{
                    title: "Select",
                    onClick: ()=>setActiveServerId(item?.id)
                }
            ];
        } else {
            return [
                {
                    title: "Edit",
                    onClick: () => onEditServer && onEditServer(item)
                },
                {
                    title: "Delete",
                    onClick: () => onDeleteServer && onDeleteServer(item.id)
                },{
                    title: "Select",
                    onClick: ()=>setActiveServerId && setActiveServerId(item?.id)
                }
            ];
        }
    };

    const renderServers = () => {
        try {
            return serverList && serverList.map((server, index) => {
                const { title, isDefault, description, status, domain, port, dueDate} = server;
                const buttons = getButtons(server, isDefault);

                return (
                    <div key={index} className="col-lg-4 col-md-6 col-sm-6 mb-4 mt-md-0">
                        <div className="card">
                            <div className="card-body p-3">
                                <div className="d-flex mt-n2">
                                    <div className="avatar avatar-xl bg-gradient-dark border-radius-xl p-2 mt-n4">
                                        <Computer sx={{ fontSize: 30, color: 'white' }} />
                                    </div>
                                    <div className="ms-3 my-auto">
                                        <h6 className="mb-0">{title || `${domain}:${port}`}</h6>
                                        <div className="avatar-group mt-0 pt-0">
                                           {`${domain}:${port}`==activeServerId?( <span className={`badge ${status === 'online' ? 'bg-success' : 'bg-danger'}`}>
                                                {status || 'unknown'}
                                            </span>):''}
                                        </div>
                                    </div>
                                    <div className="ms-auto">
                                        <DropdownButton buttons={buttons} />
                                    </div>
                                </div>
                                <p className="text-sm mt-3">{description || 'No description'}</p>
                                <hr className="horizontal dark" />
                                <div className="row">
                                    <div className="col-6">
                                        <h6 className="text-sm mb-0">Custom</h6>
                                        <p className="text-secondary text-sm  mb-0">
                                            {!isDefault ? 'Yes' : "No"}
                                        </p>
                                    </div>
                                    <div className="col-6 text-end">
                                        <h6 className="text-sm mb-0">{dueDate}</h6>
                                        <p className="text-secondary text-sm  mb-0">Create</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            });
        } catch (e) {
            console.log(e);
            return null;
        }
    };

    return (
        <section className="py-3 px-md-4">
            <div className="row mb-4 mb-md-0">
                <div className="col-md-8 me-auto my-auto text-left">
                    <h5>Servers</h5>
                    <p>Add new or edit</p>
                </div>
                <div className="col-lg-4 col-md-12 my-auto text-end">
                    <AddNewButton 
                        title={'Add New'} 
                        iconName={'add'} 
                        onChance={() => { onAddServer(); }} 
                    />
                </div>
            </div>
            <div className="row mt-lg-4 mt-2">
                {renderServers()}
            </div>
        </section>
    );
}

export default Servers;