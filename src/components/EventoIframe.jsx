import React from 'react';
import PropTypes from 'prop-types';

const EventoIframe = ({ iframeContent, title = "", fullWidth = false }) => {
    //verificação
    if (!iframeContent) return null;

    return (
        <div className="mt-6 shadow-md rounded-xl bg-white">
            {title && <h2 className="text-xl font-semibold text-font-primary mb-3 pl-2 pt-1">{title}</h2>}
            <div className={`overflow-hidden rounded-lg ${fullWidth ? 'w-full' : 'max-w-3xl'}`}>
                <div
                    className="iframe-container w-full relative"
                    style={{ paddingBottom: '56.25%' }}
                >
                    <div
                        className="absolute top-0 left-0 w-full h-full"
                        dangerouslySetInnerHTML={{ __html: iframeContent }}
                    />
                </div>
            </div>
        </div>
    );
};

EventoIframe.propTypes = {
    iframeContent: PropTypes.string,
    title: PropTypes.string,
    fullWidth: PropTypes.bool
};

export default EventoIframe;