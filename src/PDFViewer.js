import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Ensure text/annotation layers are styled correctly

// Set the workerSrc explicitly for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewerModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState({ x: 100, y: 100, width: 75, height: 75 }); // Preset box size to 75x75
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
    const canvasRef = useRef(null);

    // Open and close the modal
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Handle mouse events for dragging the box
    const handleMouseDown = (event) => {
        const page = document.querySelector('.react-pdf__Page__canvas');
        const { left, top } = page.getBoundingClientRect();
        const clickX = event.clientX - left;
        const clickY = event.clientY - top;

        // Check if the click is within the box area
        if (
            clickX >= selectedArea.x &&
            clickX <= selectedArea.x + selectedArea.width &&
            clickY >= selectedArea.y &&
            clickY <= selectedArea.y + selectedArea.height
        ) {
            // Start dragging and calculate the offset where the user clicked inside the box
            setIsDragging(true);
            setOffset({
                x: clickX - selectedArea.x,
                y: clickY - selectedArea.y,
            });
        }
    };

    const handleMouseMove = (event) => {
        if (!isDragging) return;

        const page = document.querySelector('.react-pdf__Page__canvas');
        const { left, top } = page.getBoundingClientRect();
        const currentX = event.clientX - left;
        const currentY = event.clientY - top;

        // Calculate the new box position, ensuring it stays within the PDF boundaries
        let newX = currentX - offset.x;
        let newY = currentY - offset.y;

        newX = Math.max(0, Math.min(newX, pageDimensions.width - selectedArea.width));
        newY = Math.max(0, Math.min(newY, pageDimensions.height - selectedArea.height));

        // Update the box position
        setSelectedArea({
            ...selectedArea,
            x: newX,
            y: newY,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false); // Stop dragging when the mouse is released
    };

    const onLoadSuccess = (page) => {
        const { width, height } = page.getViewport({ scale: 1 });
        setPageDimensions({ width, height });
    };

    const handleConfirm = () => {
        // Log the final selected coordinates when the Confirm button is clicked
        console.log('Selected Coordinates:', selectedArea);
        closeModal(); // Close the modal
    };

    return (
        <div>
            {/* Button to open the modal */}
            <button onClick={openModal}>Open PDF Viewer</button>

            {/* Modal */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            width: `${pageDimensions.width + 40}px`, // Add padding space
                            height: `${pageDimensions.height + 100}px`, // Add space for buttons
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* PDF Viewer */}
                        <div
                            style={{ position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            ref={canvasRef}
                        >
                            <Document
                                file="/assets/file.pdf"
                                onLoadError={console.error}
                                onSourceError={console.error}
                            >
                                <Page
                                    pageNumber={1}
                                    onLoadSuccess={onLoadSuccess}
                                    width={pageDimensions.width > 0 ? pageDimensions.width : 600} // Set initial width
                                    renderTextLayer={false} // Disable the text layer
                                />
                            </Document>

                            {/* Grey overlay */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: `${pageDimensions.width}px`,
                                    height: `${pageDimensions.height}px`,
                                    backgroundColor: 'rgba(128, 128, 128, 0.7)',
                                    pointerEvents: 'none', // Let the mouse pass through the overlay
                                }}
                            />

                            {/* Draggable selection box */}
                            {selectedArea && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: `${selectedArea.y}px`,
                                        left: `${selectedArea.x}px`,
                                        width: `${selectedArea.width}px`,
                                        height: `${selectedArea.height}px`,
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent box
                                        border: '2px solid black',
                                    }}
                                />
                            )}
                        </div>

                        {/* Buttons container */}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            {/* Confirm Button */}
                            <button onClick={handleConfirm} style={{ padding: '10px 20px' }}>
                                Confirm Selection
                            </button>

                            {/* Close Modal Button */}
                            <button onClick={closeModal} style={{ padding: '10px 20px' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDFViewerModal;
