import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import mapCoordinates from '../data/mapCoordinates.json';

const InteractiveMap = () => {
    const navigate = useNavigate();
    const mapRef = useRef(null);

    useGSAP(() => {
        // Target all groupings that correspond to our map coordinates
        const pins = mapRef.current.querySelectorAll('.map-pin');

        pins.forEach((pin) => {
            const circle = pin.querySelector('.pin-circle');

            // Hover enter: Scale up and pulse
            pin.addEventListener('mouseenter', () => {
                document.body.style.cursor = 'pointer';
                gsap.to(pin, { scale: 1.2, transformOrigin: "center center", duration: 0.3, ease: "back.out(1.7)" });
                gsap.to(circle, { strokeWidth: 1, strokeOpacity: 1, duration: 0.3 });
            });

            // Hover leave: Reset
            pin.addEventListener('mouseleave', () => {
                document.body.style.cursor = 'default';
                gsap.to(pin, { scale: 1, duration: 0.3, ease: "power2.out" });
                gsap.to(circle, { strokeWidth: 0.5, strokeOpacity: 0.6, duration: 0.3 });
            });

            // Click: Navigate
            pin.addEventListener('click', () => {
                // In a real app, we'd pass the ID to the gallery to scroll to the specific animal
                navigate('/gallery');
            });
        });
    }, { scope: mapRef });

    return (
        <div ref={mapRef} className="w-full h-full relative overflow-hidden"
            style={{
                // Ensure the container has the same aspect ratio as the SVG (375x375) to prevent misalignment
                aspectRatio: '375/375',
                maxHeight: '100vh'
            }}>

            {/* The base map image */}
            {/* Using the SVG directly as an image source to ensure perfect scaling */}
            <img
                src="/img/map.svg"
                alt="Digital Guide Map"
                className="w-full h-full object-contain absolute top-0 left-0"
            />

            {/* Interactive Overlay Layer */}
            {/* ViewBox matches the original SVG coordinates found in the analysis (0 0 375 375) */}
            <svg
                viewBox="0 0 375 375"
                className="w-full h-full absolute top-0 left-0 pointer-events-none"
                preserveAspectRatio="xMidYMid meet"
            >
                {mapCoordinates.map((coord, index) => (
                    <g
                        key={`${coord.id}-${index}`}
                        className="map-pin pointer-events-auto"
                    // Center is at coord.x, coord.y (which calculated centroid)
                    >
                        {/* Invisible hit area for easier clicking */}
                        <circle
                            cx={coord.x}
                            cy={coord.y}
                            r={Math.max(coord.width, coord.height) / 1.5}
                            fill="transparent"
                        />

                        {/* Visible Highlight Circle - Dashed and pulsing */}
                        <circle
                            className="pin-circle"
                            cx={coord.x}
                            cy={coord.y}
                            r={Math.max(coord.width, coord.height) / 2 + 5}
                            fill="transparent"
                            stroke="white"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                            strokeOpacity="0.6"
                        />

                        {/* Optional: Small center dot for precision visualization */}
                        {/* <circle cx={coord.x} cy={coord.y} r="1" fill="rgba(255,255,255,0.5)" /> */}
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default InteractiveMap;
