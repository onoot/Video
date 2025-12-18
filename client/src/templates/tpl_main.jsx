import React, { useState } from 'react';

const Tpl_main = (props) => {
    const { page } = props;

    return (
        <>
            <main
                style={{ padding: 10 + 'px' }}
                className="position-relative h-100 border-radius-lg ">

                {page}

            </main>
        </>
    );
};

export default Tpl_main;