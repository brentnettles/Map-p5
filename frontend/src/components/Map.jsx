import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import centerIcon from '../buttons/center.png';
import '../Style/Map.css';
import ArtworkList from './ArtworkList';
import { useAuth } from '../contexts/AuthContext';
import { getHighlightedGalleries } from '../services/apiService';
import SelectionControls from './SelectHighlight';

function Map_visual() {
    const svgRef = useRef();
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [highlightMode, setHighlightMode] = useState('all');
    const { user, collections } = useAuth();
    const zoom = useRef(d3.zoom().scaleExtent([1, 8]));
    const [highlightedGalleries, setHighlightedGalleries] = useState(new Set());

   
    // useEffect(() => {
    //     fetch("/MetMap.svg")
    //         .then(res => res.text())
    //         .then(svg => {
    //             svgRef.current.innerHTML = svg;
    //             const svgElement = svgRef.current.querySelector('svg');
    //             enhanceSVG(svgElement);
    //             highlightSavedGalleries(svgElement);
    //         });
    // }, [highlightedGalleries]);

    useEffect(() => {
        // Only fetch and set up the SVG once
        fetch("/MetMap.svg")
            .then(res => res.text())
            .then(svg => {
                svgRef.current.innerHTML = svg;
                const svgElement = svgRef.current.querySelector('svg');
                enhanceSVG(svgElement); // Apply zoom and interaction handlers
            });
    }, []);

    // useEffect(() => {
    //     if (user) {
    //         // Only fetch and set up the SVG if there's a logged-in user
    //         fetch("/MetMap.svg")
    //             .then(res => res.text())
    //             .then(svg => {
    //                 svgRef.current.innerHTML = svg;
    //                 const svgElement = svgRef.current.querySelector('svg');
    //                 enhanceSVG(svgElement);
    //             });
    //     }
    // }, [user]);

    // useEffect(() => {
    //     const fetchGalleries = async () => {
    //         try {
    //             // Check if highlightMode is set to use collections
    //             const collectionId = highlightMode === 'collection' ? selectedGallery : null;
    //             const response = await getHighlightedGalleries(user.id, collectionId);
    //             setHighlightedGalleries(new Set(response.highlighted_galleries));
    //         } catch (error) {
    //             console.error("Error fetching highlighted galleries:", error);
    //         }
    //     };
    
    //     fetchGalleries();
    // }, [user.id, highlightMode, selectedGallery]);
    useEffect(() => {
        if (user) {
            const fetchGalleries = async () => {
                try {
                    const collectionId = highlightMode === 'collection' ? selectedGallery : null;
                    const response = await getHighlightedGalleries(user.id, collectionId);
                    setHighlightedGalleries(new Set(response.highlighted_galleries));
                } catch (error) {
                    console.error("Error fetching highlighted galleries:", error);
                }
            };
        
            fetchGalleries();
        }
    }, [user, highlightMode, selectedGallery]);

    // const enhanceSVG = (svgElement) => {
    //     const svg = d3.select(svgElement);
    //     zoom.current.on('zoom', (event) => {
    //         svg.select('#Layer_1').attr('transform', event.transform);
    //         svg.select('#Floor_1_Galleries').attr('transform', event.transform);
    //     });
    //     svg.call(zoom.current);
    //     svg.call(zoom.current.transform, d3.zoomIdentity);
    //     setupInteractions(svg);
    // };

    const enhanceSVG = (svgElement) => {
        const svg = d3.select(svgElement);
        zoom.current.on('zoom', (event) => {
            svg.selectAll('#Layer_1, #Floor_1_Galleries').attr('transform', event.transform);
        });
        svg.call(zoom.current);
        setupInteractions(svg);
    };

    useEffect(() => {
        const svgElement = svgRef.current.querySelector('svg');
        if (svgElement) {
            highlightSavedGalleries(svgElement);
        }
    }, [highlightedGalleries]);

    
    const setGalleryFill = (rect, isHighlighted) => {
        rect.transition().duration(150).style('fill', isHighlighted ? 'rgba(255, 0, 0, 0.5)' : '');
    };

    const highlightSavedGalleries = (svgElement) => {
        const svg = d3.select(svgElement);
        const galleriesLayer = svg.select('#Floor_1_Galleries');

        galleriesLayer.selectAll('rect').each(function() {
            const rect = d3.select(this);
            const id = rect.attr('id').replace(/[_]/g, '');
            const isHighlighted = highlightedGalleries.has(id);
            setGalleryFill(rect, isHighlighted);
        });
    };

    const setupInteractions = (svg) => {
        const galleriesLayer = svg.select('#Floor_1_Galleries');
        galleriesLayer.selectAll('rect').each(function() {
            const rect = d3.select(this);
            const id = rect.attr('id').replace(/[_]/g, '');
            const group = rect.node().parentNode.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));

            d3.select(group)
                .attr('class', 'room-group')
                .style('cursor', 'pointer')
                .on('click', () => setSelectedGallery(id))
                .on('mouseover', () => {
                    const isHighlighted = highlightedGalleries.has(id);
                    rect.transition().duration(150).style('fill', isHighlighted ? 'rgba(255, 0, 0, 0.5)' : 'salmon');
                })
                .on('mouseout', () => {
                    const isHighlighted = highlightedGalleries.has(id);
                    setGalleryFill(rect, isHighlighted);
                });

            group.appendChild(rect.node());
            d3.select(group).append('text')
                .attr('x', parseFloat(rect.attr('x')) + parseFloat(rect.attr('width')) / 2)
                .attr('y', parseFloat(rect.attr('y')) + parseFloat(rect.attr('height')) / 2)
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .text(id)
                .style('fill', 'black')
                .style('font-size', `${Math.min(parseFloat(rect.attr('width')), parseFloat(rect.attr('height'))) / 3}px`);
        });
    };

    const recenterSVG = (event) => {
        event.stopPropagation();
        d3.select(svgRef.current.querySelector('svg')).transition().duration(750).call(zoom.current.transform, d3.zoomIdentity);
    };

    return (
        <>
        <div className='SelectHighlight'>
            <SelectionControls
                    setHighlightMode={setHighlightMode}
                    setSelectedGallery={setSelectedGallery}
                    collections={collections}
                />
        </div>
        <div className="main-container">
                
            <div className="floorplan-container" style={{ position: 'relative' }}>
                <div ref={svgRef} className="floorplan-svg-container" />
                <button
                    id="recenter-button"
                    onClick={recenterSVG}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        background: `url(${centerIcon}) no-repeat center center`,
                        backgroundSize: 'cover',
                        width: '50px',
                        height: '50px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                ></button>
                <div className="artwork-display-container">
                    {selectedGallery && (
                        <ArtworkList galleryNumber={selectedGallery} />
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default Map_visual;
