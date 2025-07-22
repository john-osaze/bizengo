
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

interface InvoiceTemplateProps {
    imageUrl: string;
    onClose: () => void;
    popupRef: React.RefObject<HTMLDivElement | null>;
}

const InvoiceTemplate = ({ imageUrl, onClose, popupRef }: InvoiceTemplateProps) => {

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div ref={popupRef} className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto">

                <div className="w-full max-w-[500px]">
                    <Image
                        src={imageUrl}
                        alt="Template Preview"
                        width={600}
                        height={400}
                        className="rounded-md"
                        style={{
                            width: '100%',
                            height: 'auto',
                        }}
                    />
                </div>
                <Button variant="outline" className="mt-4" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
};

export default InvoiceTemplate;