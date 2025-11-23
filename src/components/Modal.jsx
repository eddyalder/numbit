import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, title, children, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">{title}</h2>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`modal-btn ${isDanger ? 'danger' : 'primary'}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
