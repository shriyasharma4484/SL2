import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Loader2 } from 'lucide-react';

function createPickerIcon() {
  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
    ">
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        background-color: rgba(16, 185, 129, 0.3);
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      "></div>
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        background-color: #065f46;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background-color: #34d399; border-radius: 50%;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'picker-pin',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
  height = '320px'
}) {
  const defaultLat = latitude || 18.5204;
  const defaultLng = longitude || 73.8567;
  const [position, setPosition] = useState([defaultLat, defaultLng]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  const handlePick = (lat, lng) => {
    setPosition([lat, lng]);
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handlePick(lat, lng);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve GPS location. Please click directly on the Pune map to pinpoint the problem spot.');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const icon = createPickerIcon();

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm" style={{ height }}>
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap position={position} />
        <MapClickHandler onPick={handlePick} />

        <Marker
          position={position}
          icon={icon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const latLng = marker.getLatLng();
              handlePick(latLng.lat, latLng.lng);
            }
          }}
        />
      </MapContainer>

      {/* Action overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={locating}
          className="bg-white/95 hover:bg-white text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-1.5 backdrop-blur-sm transition-all"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{locating ? 'Locating GPS...' : 'Use My Current Location'}</span>
        </button>
      </div>

      <div className="absolute bottom-2 left-2 z-20 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-emerald-400" />
        <span>Click or drag pin to exact problem spot ({position[0].toFixed(5)}, {position[1].toFixed(5)})</span>
      </div>
    </div>
  );
}
