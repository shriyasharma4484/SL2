import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import { MapPin, ExternalLink, ThumbsUp, Flame } from 'lucide-react';

// Custom DivIcon generator with Chronic Hotspot indicator
function createCustomIcon(status, category, isHotspot = false) {
  let color = '#10b981'; // green for resolved
  let ring = '#d1fae5';

  if (isHotspot) {
    color = '#dc2626'; // bold crimson red
    ring = '#fee2e2';
  } else if (status === 'Critical' || status === 'Rejected') {
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

  const hotspotBadge = isHotspot
    ? `<span style="position: absolute; top: -6px; right: -6px; background: #dc2626; color: white; font-size: 9px; font-weight: bold; padding: 1px 3px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">🔥</span>`
    : '';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
    ">
      <div style="
        position: absolute;
        width: 34px;
        height: 34px;
        background-color: ${ring};
        border-radius: 50%;
        opacity: 0.85;
      "></div>
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
      </div>
      ${hotspotBadge}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
}

// Cluster algorithm to find recurring chronic black spots within ~250m
function findChronicHotspots(issues, radiusMeters = 250) {
  const clusters = [];
  const hotspotIssueIds = new Set();

  for (let i = 0; i < issues.length; i++) {
    if (!issues[i].latitude || !issues[i].longitude) continue;
    const lat1 = parseFloat(issues[i].latitude);
    const lng1 = parseFloat(issues[i].longitude);
    const cluster = [issues[i]];

    for (let j = i + 1; j < issues.length; j++) {
      if (!issues[j].latitude || !issues[j].longitude) continue;
      const lat2 = parseFloat(issues[j].latitude);
      const lng2 = parseFloat(issues[j].longitude);

      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const dist = 6371e3 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      if (dist <= radiusMeters) {
        cluster.push(issues[j]);
      }
    }

    if (cluster.length >= 2) {
      cluster.forEach((iss) => hotspotIssueIds.add(iss.id));
      // Only keep unique clusters
      const alreadyIncluded = clusters.some(
        (c) => Math.abs(c.lat - lat1) < 0.001 && Math.abs(c.lng - lng1) < 0.001
      );
      if (!alreadyIncluded) {
        clusters.push({
          id: `hotspot-${i}`,
          lat: lat1,
          lng: lng1,
          count: cluster.length,
          area: issues[i].area || 'Pune Zone',
          issues: cluster
        });
      }
    }
  }

  return { clusters, hotspotIssueIds };
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
  const [showHotspots, setShowHotspots] = useState(false);

  // Compute chronic hotspots from current issues
  const { clusters, hotspotIssueIds } = useMemo(
    () => findChronicHotspots(issues),
    [issues]
  );

  const mapCenter = selectedIssue && selectedIssue.latitude && selectedIssue.longitude
    ? [parseFloat(selectedIssue.latitude), parseFloat(selectedIssue.longitude)]
    : center;

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      {/* Top Left Hotspot Toggle Pill */}
      <div className="absolute top-3 left-14 z-20">
        <button
          type="button"
          onClick={() => setShowHotspots(!showHotspots)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer backdrop-blur-md border ${
            showHotspots
              ? 'bg-rose-600 text-white border-rose-700 shadow-rose-200'
              : 'bg-white/95 text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
          title="Toggle recurring chronic garbage dumping black spots"
        >
          <Flame className={`w-3.5 h-3.5 ${showHotspots ? 'text-amber-200 animate-pulse' : 'text-rose-600'}`} />
          <span>
            {showHotspots
              ? `🔥 Chronic Hotspots Active (${clusters.length} Zones)`
              : `Detect Chronic Black-Spots (${clusters.length})`}
          </span>
        </button>
      </div>

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

        {/* Chronic Hotspot Heat Circles */}
        {showHotspots &&
          clusters.map((cluster) => (
            <Circle
              key={cluster.id}
              center={[cluster.lat, cluster.lng]}
              radius={220}
              pathOptions={{
                color: '#dc2626',
                fillColor: '#ef4444',
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '4, 4'
              }}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-extrabold text-rose-700">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Chronic Dumping Hotspot</span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    {cluster.count} recurring reports clustered in {cluster.area} within 250m.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Recommended for municipal surveillance / permanent container placement.
                  </p>
                </div>
              </Popup>
            </Circle>
          ))}

        {issues.map((issue) => {
          if (!issue.latitude || !issue.longitude) return null;
          const pos = [parseFloat(issue.latitude), parseFloat(issue.longitude)];
          const isHotspot = hotspotIssueIds.has(issue.id);
          const icon = createCustomIcon(issue.status, issue.category, isHotspot && showHotspots);

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

                  {isHotspot && showHotspots && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full mb-1">
                      <Flame className="w-3 h-3 text-rose-600" />
                      <span>Chronic Hotspot Zone</span>
                    </div>
                  )}

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
        <div className="flex items-center gap-2 border-t border-slate-200/60 pt-1 mt-1">
          <span className="text-xs">🔥</span>
          <span className="text-rose-700 font-bold">Chronic Dumping Hotspot</span>
        </div>
      </div>
    </div>
  );
}
