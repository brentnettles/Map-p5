import React, { useState } from 'react';
import '../Style/SelectHighlight.css'; // Make sure to import the CSS correctly

function SelectionControls({ setHighlightMode, setSelectedGallery, collections }) {
    const [showCollections, setShowCollections] = useState(false);

    const toggleCollections = () => setShowCollections(!showCollections);

    const handleCollectionSelect = (collectionId) => {
        if (collectionId === null) {
            setHighlightMode('all');
            setSelectedGallery(null);
        } else {
            setHighlightMode('collection');
            setSelectedGallery(collectionId);
        }
    };

    return (
        <div className="selection-controls">
            <button onClick={toggleCollections}>
                {showCollections ? "Show All Galleries" : "Map by Collection"}
            </button>
            {showCollections && (
                <ul>
                    <li>
                        <button onClick={() => handleCollectionSelect(null)} className="full-width">
                            All Saved Artworks
                        </button>
                    </li>
                    {collections.map(col => (
                        <li key={col.id}>
                            <button onClick={() => handleCollectionSelect(col.id)} className="full-width">
                                {col.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SelectionControls;
