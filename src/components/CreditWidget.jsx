import React from 'react';
import './CreditWidget.css';

const CreditWidget = () => {
    return (
        <a
            href="https://www.edwardalder.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="credit-widget"
        >
            <div className="credit-content">
                <span className="credit-text">Made by</span>
                <span className="credit-name">Edward Alder</span>
            </div>
            <img src="/edward-favicon.svg" alt="Edward Alder" className="credit-icon" />
        </a>
    );
};

export default CreditWidget;
