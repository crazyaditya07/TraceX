import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different stages
const createCustomIcon = (color, emoji) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

const stageIcons = {
    manufactured: createCustomIcon('#6366f1', '🏭'),
    indistribution: createCustomIcon('#06b6d4', '🚚'),
    inretail: createCustomIcon('#10b981', '🏪'),
    sold: createCustomIcon('#a855f7', '✅'),
    default: createCustomIcon('#64748b', '📍'),
};

// Component to fit bounds
function FitBounds({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, positions]);

    return null;
}

function LocationMap({ checkpoints = [], height = 400 }) {
    // Filter checkpoints with valid coordinates
    const validCheckpoints = checkpoints.filter(cp => {
        const coords = cp.location?.coordinates;
        return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
    });

    // If no valid coordinates, show placeholder
    if (validCheckpoints.length === 0) {
        return (
            <div
                className="map-container"
                style={{
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-tertiary)',
                    flexDirection: 'column',
                    gap: '16px'
                }}
            >
                <div style={{ fontSize: '3rem' }}>🗺️</div>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    No location data available for this product
                </p>
                <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Location coordinates are required to display the map
                </p>
            </div>
        );
    }

    const positions = validCheckpoints.map(cp => [
        cp.location.coordinates.lat,
        cp.location.coordinates.lng
    ]);

    const polylinePositions = positions.length > 1 ? positions : [];

    const center = positions[0] || [20.5937, 78.9629]; // Default to India center

    const getMarkerIcon = (stage) => {
        const key = stage?.toLowerCase().replace(' ', '');
        return stageIcons[key] || stageIcons.default;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="map-container" style={{ height }}>
            <MapContainer
                center={center}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds positions={positions} />

                {/* Draw route line */}
                {polylinePositions.length > 1 && (
                    <Polyline
                        positions={polylinePositions}
                        pathOptions={{
                            color: '#6366f1',
                            weight: 3,
                            opacity: 0.7,
                            dashArray: '10, 10',
                        }}
                    />
                )}

                {/* Place markers */}
                {validCheckpoints.map((checkpoint, index) => (
                    <Marker
                        key={index}
                        position={[
                            checkpoint.location.coordinates.lat,
                            checkpoint.location.coordinates.lng
                        ]}
                        icon={getMarkerIcon(checkpoint.stage)}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    color: '#1a1a2e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 8px',
                                        background: '#6366f1',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}>
                                        Step {index + 1}
                                    </span>
                                    {checkpoint.stage}
                                </h4>
                                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                                    <strong>Location:</strong><br />
                                    {checkpoint.location.address || 'Unknown address'}
                                </p>
                                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                                    <strong>Time:</strong><br />
                                    {formatDate(checkpoint.timestamp)}
                                </p>
                                {checkpoint.handler && (
                                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                                        <strong>Handler:</strong><br />
                                        <code style={{
                                            background: '#f1f5f9',
                                            padding: '2px 4px',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}>
                                            {checkpoint.handler.slice(0, 10)}...
                                        </code>
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default LocationMap;
