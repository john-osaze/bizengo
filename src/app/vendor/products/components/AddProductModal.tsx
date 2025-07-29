'use client';

import React, { useEffect } from 'react';

interface AddProductModalProps {
    onClose: () => void;
    onProductAdded: (newProduct: any) => void; // Replace 'any' with 'Product' if available
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onProductAdded }) => {
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.warn('Placeholder: AddProductModal is not implemented yet.');
    }, []);
    return (
        <div>
            {/* Modal content */}
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default AddProductModal;
