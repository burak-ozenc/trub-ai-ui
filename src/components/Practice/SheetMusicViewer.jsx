import React, {useState} from 'react';
import {FileText, Download, ZoomIn, ZoomOut} from 'lucide-react';

const SheetMusicViewer = ({sheetMusicUrl, exerciseTitle}) => {
    const [zoom, setZoom] = useState(100);

    if (!sheetMusicUrl) {
        return (
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400"/>
                    <p>No sheet music available for this exercise</p>
                </div>
            </div>
        );
    }

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 10, 150));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 10, 50));
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            {/* Controls */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Sheet Music</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4"/>
                    </button>
                    <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                        {zoom}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4"/>
                    </button>

                    <a href={sheetMusicUrl}
                       download={`${exerciseTitle}_sheet_music.pdf`}
                       className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                       title="Download"
                    >
                        <Download className="w-4 h-4"/>
                    </a>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="p-4 bg-gray-100 overflow-auto" style={{maxHeight: '600px'}}>
                <div style={{transform: `scale(${zoom / 100})`, transformOrigin: 'top left'}}>
                    <iframe
                        src={sheetMusicUrl}
                        className="w-full border-0 bg-white shadow-md"
                        style={{height: '800px'}}
                        title={`${exerciseTitle} sheet music`}
                    />
                </div>
            </div>
        </div>
    );
};

export default SheetMusicViewer;