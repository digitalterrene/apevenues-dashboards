"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker icon configuration
const createCustomIcon = () => {
  return L.divIcon({
    html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          animation: bounce 1s infinite;
          transform-origin: bottom;
        ">
          <svg viewBox="0 0 384 512" style="
            width: 100%;
            height: 100%;
            fill: #FFC107;
            filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));
          ">
            <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
            <circle cx="192" cy="192" r="80" fill="white"/>
          </svg>
        </div>
      `,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Dynamic imports with proper typing
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6BADA0] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
    loading: () => null,
  }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PropertyMapProps {
  address?: string;
  zipCode?: string;
  city?: string;
  province?: string;
}

const PropertyMap = ({
  address,
  city,
  province,
  zipCode,
}: PropertyMapProps) => {
  const [mapReady, setMapReady] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number]>([
    -28.4793, 24.6727,
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fullAddress = [address, city, province, zipCode]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    // Set custom marker icon
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!fullAddress) {
      setLoading(false);
      return;
    }

    const geocodeAddress = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            fullAddress
          )}&countrycodes=za&limit=1`
        );
        const data = await response.json();

        if (data.length > 0) {
          setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setError("Showing approximate location");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setError("Error loading precise location");
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [fullAddress]);

  const getZoomLevel = () => {
    if (!fullAddress) return 5;
    if (address && city) return 15;
    if (city) return 12;
    return 8;
  };

  if (!mapReady || loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6BADA0] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden relative">
      <style jsx global>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
          min-height: 100%;
        }
        .leaflet-div-icon {
          background: transparent;
          border: none;
        }
      `}</style>

      <MapContainer
        center={coordinates}
        zoom={getZoomLevel()}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={coordinates} icon={createCustomIcon()}>
          <Popup>
            <div className="text-sm">
              <MapPin className="inline h-4 w-4" /> {fullAddress || "Location"}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-yellow-100 text-yellow-800 text-xs p-2 rounded">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
