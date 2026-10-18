import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import { MapPin, ExternalLink, ThumbsUp } from 'lucide-react';

// Custom DivIcon generator for reliable rendering without broken leaflet icon URLs
function createCustomIcon(status, category) {
  let color = '#10b981'; // green for resolved
  let ring = '#d1fae5';

  if (status === 'Critical' || status === 'Rejected') {
    color = '#ef4444';
    ring = '#fee2e2';
  } else if (status === 'In Progress') {
    color = '#3b82f6';
    ring = '#dbeafe';
  } else if (status === 'Approved') {
    color = '#059669';
    ring = '#a7f3d0';
  } else if (status === 'Submitted' || status === 'Under Review') {
    color = '#f59e0b';
    ring = '#fef3c7';
  }

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    ">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        background-color: ${ring};
        border-radius: 50%;
        opacity: 0.8;
      "></div>
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function LeafletMap({
  issues = [],
  selectedIssue = null,
  center = [18.5204, 73.8567], // Pune center
  zoom = 13,
  height = '500px'
}) {
  const mapCenter = selectedIssue && selectedIssue.latitude && selectedIssue.longitude
    ? [parseFloat(selectedIssue.latitude), parseFloat(selectedIssue.longitude)]
    : center;

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={mapCenter} />

        {issues.map((issue) => {
          if (!issue.latitude || !issue.longitude) return null;
          const pos = [parseFloat(issue.latitude), parseFloat(issue.longitude)];
          const icon = createCustomIcon(issue.status, issue.category);

          return (
            <Marker key={issue.id} position={pos} icon={icon}>
              <Popup className="custom-issue-popup">
                <div className="w-64 max-w-xs p-1">
                  {issue.primary_photo && (
                    <img
                      src={issue.primary_photo}
                      alt={issue.title}
                      className="w-full h-28 object-cover rounded-lg mb-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {issue.reference_no}
                    </span>
                    <StatusBadge status={issue.status} className="scale-90 origin-right" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug">
                    {issue.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{issue.location_address || issue.area}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>{issue.confirmations_count || 0} confirms</span>
                    </span>
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-0.5"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-slate-200 text-[11px] space-y-1 hidden sm:block">
        <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Map Markers</p>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600">Resolved Issue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-600">Action In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600">Approved Community Report</span>
        </div>
      </div>
    </div>
  );
}
