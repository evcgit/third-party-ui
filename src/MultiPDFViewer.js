import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Ensure text/annotation layers are styled correctly

// Set the workerSrc explicitly for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFWithThumbnails = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
    const [pageStamps, setPageStamps] = useState({}); // Stores stamps for each page as { pageNumber: [{ x, y, width, height }] }
    const [numPages, setNumPages] = useState(null); // Track the number of pages
    const [currentPage, setCurrentPage] = useState(1); // Track the current page being viewed
    const [showStamp, setShowStamp] = useState(true); // Track if stamp box is visible

    // Open and close the modal
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Toggle stamp visibility
    const toggleStamp = () => setShowStamp(prev => !prev);

    // Handle mouse events for placing the stamp
    const handleMouseDown = (event, pageNumber) => {
        if (!showStamp) return; // If stamp is not enabled, don't place the stamp

        const page = document.querySelector(`.react-pdf__Page__canvas[data-page-number="${pageNumber}"]`);
        if (!page) return; // Prevent the error if the page element is not found

        const { left, top } = page.getBoundingClientRect();
        const clickX = event.clientX - left;
        const clickY = event.clientY - top;

        console.log("Click coordinates:", { clickX, clickY }); // Debugging click coordinates

        // Save stamp info to the current page
        const newStamp = { x: clickX - 75 / 2, y: clickY - 75 / 2, width: 75, height: 75 }; // Center the box
        setPageStamps(prev => ({
            ...prev,
            [pageNumber]: [...(prev[pageNumber] || []), newStamp], // Save stamps for each page
        }));
    };

    const onLoadSuccess = ({ numPages }) => {
        setNumPages(numPages); // Set the number of pages dynamically
    };

    const onLoadPageSuccess = (page) => {
        const { width, height } = page.getViewport({ scale: 1 });
        setPageDimensions({ width, height });
    };

    const handleConfirm = () => {
        // Log the final selected coordinates for each page
        console.log('Saved Stamps by Page:', pageStamps);
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
                            display: 'flex',
                            position: 'relative',
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '90%', // Take up 90% of the screen width
                            height: '90%', // Take up 90% of the screen height
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Thumbnail Bar */}
                        <div
                            style={{
                                width: '150px', // Fixed width for the thumbnail bar
                                height: '100%',
                                overflowY: 'auto',
                                marginRight: '20px',
                                backgroundColor: '#f0f0f0',
                                padding: '10px',
                            }}
                        >
                            <Document
                                file="/assets/file.pdf"
                                onLoadError={console.error}
                                onSourceError={console.error}
                                onLoadSuccess={onLoadSuccess} // Set the number of pages
                            >
                                {/* Thumbnails */}
                                {Array.from(new Array(numPages), (_, index) => (
                                    <div key={index + 1} onClick={() => setCurrentPage(index + 1)} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                                        <Page
                                            pageNumber={index + 1}
                                            width={100} // Set the size of the thumbnails
                                            renderTextLayer={false} // Disable the text layer
                                        />
                                    </div>
                                ))}
                            </Document>
                        </div>

                        {/* PDF Viewer - One Page at a Time */}
                        <div style={{ position: 'relative', width: 'calc(100% - 150px)', height: '100%' }}>
                            <Document
                                file="/assets/file.pdf"
                                onLoadError={console.error}
                                onSourceError={console.error}
                            >
                                <Page
                                    pageNumber={currentPage} // Only show the current page
                                    onLoadSuccess={onLoadPageSuccess}
                                    width={pageDimensions.width > 0 ? pageDimensions.width : 600} // Set initial width
                                    renderTextLayer={false} // Disable the text layer
                                    onClick={(event) => handleMouseDown(event, currentPage)} // Click to place stamp
                                />

                                {/* Grey Overlay for Coordinate Verification */}
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

                                {/* Render Stamps for the Current Page */}
                                {showStamp && pageStamps[currentPage]?.map((stamp, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            position: 'absolute',
                                            top: `${stamp.y}px`,
                                            left: `${stamp.x}px`,
                                            width: `${stamp.width}px`,
                                            height: `${stamp.height}px`,
                                            backgroundColor: 'rgba(255, 0, 0, 0.3)', // Semi-transparent red for better visibility
                                            border: '2px solid black',
                                        }}
                                    />
                                ))}
                            </Document>
                        </div>

                        {/* Buttons container */}
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                            {/* Toggle Stamp Button */}
                            <button onClick={toggleStamp} style={{ padding: '10px 20px' }}>
                                {showStamp ? 'Hide Stamp' : 'Show Stamp'}
                            </button>

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

export default PDFWithThumbnails;
