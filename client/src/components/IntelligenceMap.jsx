import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  MapPin,
  ExternalLink,
  Eye,
  Info
} from 'lucide-react';

// Custom Marker Generator with Dynamic Status Rings and Hotspot Flames
function createIntelligenceMarker(location) {
  const isChronic = location.recurrence?.isChronic;
  const priorityTier = location.priority?.priorityTier || 'Medium';
  const isSustained = location.scenario?.code === 'sustained_resolution_success' || location.scenario?.code === 'low_priority_addressed';
  const isPostRelapse = location.recurrence?.recurrenceAfterIntervention;
  const isFollowUpDue = location.scenario?.pendingFollowUp?.isDue;

  let color = '#3b82f6'; // blue default
  let ring = '#dbeafe';
  let badgeEmoji = '';

  if (isSustained) {
    color = '#10b981'; // emerald green
    ring = '#d1fae5';
    badgeEmoji = '🌿';
  } else if (priorityTier === 'Critical') {
    color = '#dc2626'; // bold crimson red
    ring = '#fee2e2';
    badgeEmoji = '⚠️';
  } else if (isChronic || isPostRelapse) {
    color = '#ea580c'; // amber orange
    ring = '#ffedd5';
    badgeEmoji = '🔥';
  } else if (priorityTier === 'High') {
    color = '#f59e0b'; // amber
    ring = '#fef3c7';
    badgeEmoji = '⚡';
  } else if (isFollowUpDue) {
    color = '#8b5cf6'; // violet
    ring = '#ede9fe';
    badgeEmoji = '📋';
  }

  const badgeHtml = badgeEmoji
    ? `<span style="position: absolute; top: -6px; right: -6px; background: ${color}; color: white; font-size: 9px; font-weight: bold; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.3); border: 1px solid white;">${badgeEmoji}</span>`
    : '';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        width: 38px;
        height: 38px;
        background-color: ${ring};
        border-radius: 50%;
        opacity: 0.85;
        animation: ${priorityTier === 'Critical' ? 'pulse 2s infinite' : 'none'};
      "></div>
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 7px; height: 7px; background-color: white; border-radius: 50%;"></div>
      </div>
      ${badgeHtml}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-intelligence-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function IntelligenceMap({
  locations = [],
  selectedLocationId = null,
  onSelectLocation = () => {},
  center = [18.5204, 73.8567], // Pune center
  height = '520px'
}) {
  const [mapError, setMapError] = useState(false);
  const [showRadius, setShowRadius] = useState(true);

  // Identify active center
  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const activeCenter = selectedLocation?.scenario?.coordinates || center;

  if (mapError) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-700 space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Info className="w-5 h-5" />
          <h3 className="font-bold text-sm">Geospatial Tile Fallback View</h3>
        </div>
        <p className="text-xs text-slate-400">
          OpenStreetMap raster tiles are offline. Displaying structured coordinate data and location coordinates below.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map(loc => (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                loc.id === selectedLocationId
                  ? 'bg-emerald-950/80 border-emerald-500 shadow-md'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {loc.scenario?.category}
                </span>
                <span className="text-xs font-black text-white">
                  Score: {loc.priority?.finalScore}/100
                </span>
              </div>
              <h4 className="font-bold text-xs text-white mt-1 line-clamp-1">{loc.scenario?.title}</h4>
              <p className="text-[11px] text-slate-400">{loc.scenario?.area}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                [{loc.scenario?.coordinates[0].toFixed(4)}, {loc.scenario?.coordinates[1].toFixed(4)}]
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
      {/* Map Header Floating Overlay */}
      <div className="absolute top-4 left-4 z-[500] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800">
            Pune Impact Intelligence Map ({locations.length} Sites)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowRadius(!showRadius)}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            showRadius
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {showRadius ? 'Hide Buffer Circles' : 'Show 250m Buffer'}
        </button>
      </div>

      {/* Map Legend Floating Overlay */}
      <div className="absolute bottom-4 right-4 z-[500] bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-slate-200/80 hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span>Critical Hazard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>Chronic Spot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>Sustained Victory</span>
        </div>
      </div>

      <div style={{ height }}>
        <MapContainer
          center={activeCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          attributionControl={false}
          onError={() => setMapError(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap center={activeCenter} />

          {locations.map(loc => {
            const scn = loc.scenario;
            if (!scn?.coordinates || !scn.coordinates[0] || !scn.coordinates[1]) return null;

            const isSelected = loc.id === selectedLocationId;
            const icon = createIntelligenceMarker(loc);

            return (
              <React.Fragment key={loc.id}>
                <Marker
                  position={scn.coordinates}
                  icon={icon}
                  eventHandlers={{
                    click: () => onSelectLocation(loc.id)
                  }}
                >
                  <Popup className="custom-intelligence-popup">
                    <div className="p-1 space-y-2 max-w-xs text-slate-800">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {scn.category}
                        </span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-900 text-white">
                          Score: {loc.priority?.finalScore}/100
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900">{scn.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{scn.subtitle || scn.area}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Recurrence:</span>
                          <strong className="text-slate-700">{loc.recurrence?.recurrenceCategory}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Physical Incidents:</span>
                          <strong className="text-slate-700">{loc.recurrence?.physicalIncidentCount}</strong>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => onSelectLocation(loc.id)}
                          className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Intelligence Dossier</span>
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {showRadius && (
                  <Circle
                    center={scn.coordinates}
                    radius={250}
                    pathOptions={{
                      color: isSelected ? '#10b981' : (loc.recurrence?.isChronic ? '#dc2626' : '#94a3b8'),
                      fillColor: isSelected ? '#34d399' : (loc.recurrence?.isChronic ? '#ef4444' : '#cbd5e1'),
                      fillOpacity: isSelected ? 0.22 : 0.12,
                      weight: isSelected ? 2.5 : 1.2,
                      dashArray: loc.recurrence?.isChronic ? '4, 4' : null
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
