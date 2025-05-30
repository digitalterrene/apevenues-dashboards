
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../../types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, selectedProperty }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainer.current).setView([40.7128, -74.0060], 10);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for properties
    if (properties.length > 0) {
      const group = new L.FeatureGroup();

      properties.forEach((property) => {
        // Generate random coordinates around NYC for demo
        const lat = 40.7128 + (Math.random() - 0.5) * 0.1;
        const lng = -74.0060 + (Math.random() - 0.5) * 0.1;

        const marker = L.marker([lat, lng])
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-lg">${property.name}</h3>
              <p class="text-sm text-gray-600">${property.type}</p>
              <p class="text-sm">${property.address}</p>
              <p class="text-sm">Capacity: ${property.capacity}</p>
              <div class="mt-2">
                <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                  ${property.priceRange}
                </span>
              </div>
            </div>
          `);

        if (selectedProperty && selectedProperty.id === property.id) {
          marker.openPopup();
        }

        group.addLayer(marker);
        markersRef.current.push(marker);
      });

      group.addTo(mapRef.current);
      
      // Fit map to show all markers
      if (properties.length > 1) {
        mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }

    return () => {
      markersRef.current.forEach(marker => {
        mapRef.current?.removeLayer(marker);
      });
    };
  }, [properties, selectedProperty]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-96 rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export default PropertyMap;
