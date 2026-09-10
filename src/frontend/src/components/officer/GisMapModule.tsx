import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { 
  Layers, 
  Filter, 
  MapPin, 
  Search, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  Eye, 
  Maximize2, 
  Compass, 
  Info,
  Building2
} from 'lucide-react';
import { LandParcel } from '../../types';

export const GisMapModule: React.FC = () => {
  const { parcels, projects, navigate, updateParcelStatus, showToast } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [baseLayerType, setBaseLayerType] = useState<'STREET' | 'SATELLITE'>('STREET');
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);

  const baseTilesRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center around Delhi NCR / Haryana
    const map = L.map(mapContainerRef.current, {
      center: [28.8500, 77.1000],
      zoom: 11,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const streetTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | BhoomiSetu GIS'
    }).addTo(map);

    baseTilesRef.current = streetTile;

    const layersGroup = L.featureGroup().addTo(map);
    layersGroupRef.current = layersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTilesRef.current) return;

    mapInstanceRef.current.removeLayer(baseTilesRef.current);

    if (baseLayerType === 'STREET') {
      baseTilesRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | BhoomiSetu Cadastre'
      }).addTo(mapInstanceRef.current);
    } else {
      // Satellite Imagery (Esri World Imagery)
      baseTilesRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapInstanceRef.current);
    }
  }, [baseLayerType]);

  // Render Polygons & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const layersGroup = layersGroupRef.current;
    layersGroup.clearLayers();

    const filtered = parcels.filter(p => {
      const matchProj = selectedProject === 'ALL' || p.projectId === selectedProject;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      return matchProj && matchStatus;
    });

    // Custom Icon generator
    filtered.forEach(parcel => {
      let fillColor = '#3b82f6'; // blue
      let strokeColor = '#1d4ed8';

      if (parcel.status === 'Acquired') {
        fillColor = '#10b981'; // emerald
        strokeColor = '#047857';
      } else if (parcel.status === 'Disputed') {
        fillColor = '#ef4444'; // red
        strokeColor = '#b91c1c';
      } else if (parcel.status === 'Compensation Pending' || parcel.status === 'Pending') {
        fillColor = '#f59e0b'; // amber
        strokeColor = '#b45309';
      }

      // 1. Draw polygon if boundaryPolygon exists or generate one around centroid
      const lat = parcel.latitude || 28.8500;
      const lng = parcel.longitude || 77.1000;
      const latLngs: [number, number][] = parcel.boundaryPolygon && parcel.boundaryPolygon.length > 2
        ? parcel.boundaryPolygon
        : [
            [lat - 0.003, lng - 0.003],
            [lat - 0.003, lng + 0.003],
            [lat + 0.003, lng + 0.003],
            [lat + 0.003, lng - 0.003]
          ];

      const polygon = L.polygon(latLngs, {
        color: strokeColor,
        fillColor: fillColor,
        fillOpacity: 0.55,
        weight: 2
      });

      polygon.on('click', () => {
        setSelectedParcel(parcel);
      });

      polygon.bindTooltip(`<strong>${parcel.id}</strong>: ${parcel.ownerName}<br/>Khasra: ${parcel.khasraNumber} (${parcel.status})`, {
        sticky: true
      });

      layersGroup.addLayer(polygon);

      // 2. Add Center Marker
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${fillColor}; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${parcel.id.slice(0, 2)}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedParcel(parcel);
      });
      layersGroup.addLayer(marker);
    });

    // Draw alignment corridors for active projects
    const corridorPoints: [number, number][] = [
      [28.7500, 77.1200],
      [28.8200, 77.1000],
      [28.8900, 77.0800],
      [28.9500, 77.0600],
      [29.0200, 77.0400]
    ];

    const corridorPolyline = L.polyline(corridorPoints, {
      color: '#1e3a8a',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.7
    });
    corridorPolyline.bindTooltip('NHAI Access-Controlled Delhi-Meerut RoW Corridor (Right-of-Way Buffer: 60m)', { sticky: true });
    layersGroup.addLayer(corridorPolyline);

  }, [parcels, selectedProject, selectedStatus]);

  const handleZoomToParcel = (parcel: LandParcel) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([parcel.latitude || 28.8500, parcel.longitude || 77.1000], 15, {
        animate: true
      });
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Map Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-900 text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
              GIS Cadastral Land Acquisition Map
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive multi-layer geo-demarcation, Khasra polygon tracking, and right-of-way corridor overlays.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 font-medium"
          >
            <option value="ALL">All Acquisition Projects</option>
            {projects.map(pr => (
              <option key={pr.id} value={pr.id}>{pr.id} — {pr.name.slice(0, 25)}...</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Acquired">🟢 Acquired Only</option>
            <option value="In Progress">🔵 In Progress</option>
            <option value="Pending">🟡 Pending Verification</option>
            <option value="Disputed">🔴 Disputed Only</option>
          </select>

          {/* Base Layer Switch */}
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-xs">
            <button
              onClick={() => setBaseLayerType('STREET')}
              className={`px-3 py-1.5 font-bold transition-colors cursor-pointer ${
                baseLayerType === 'STREET' ? 'bg-blue-900 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
              }`}
            >
              Cadastral
            </button>
            <button
              onClick={() => setBaseLayerType('SATELLITE')}
              className={`px-3 py-1.5 font-bold transition-colors cursor-pointer ${
                baseLayerType === 'SATELLITE' ? 'bg-blue-900 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Map Main Canvas Area */}
      <div className="relative h-[650px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Legend Box in Top Left */}
        <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 text-xs w-56 space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-800" />
            <span>Cadastral Status Legend</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-700"></span>
                <span>Acquired & Mutated</span>
              </span>
              <strong className="text-emerald-700">68%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-xs bg-amber-500 border border-amber-700"></span>
                <span>Pending / Valuation</span>
              </span>
              <strong className="text-amber-700">22%</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-xs bg-red-500 border border-red-700"></span>
                <span>Disputed / Litigation</span>
              </span>
              <strong className="text-red-700">10%</strong>
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-900"></span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">NHAI Alignment Right of Way</span>
            </div>
          </div>
        </div>

        {/* Selected Parcel Drawer / Detail Card (Bottom or Right) */}
        {selectedParcel && (
          <div className="absolute top-4 right-4 bottom-4 z-10 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-right-3">
            <div className="p-4 bg-[#0c2340] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-amber-400">
                  {selectedParcel.id} • {selectedParcel.landType}
                </span>
                <h3 className="font-bold text-sm text-white">
                  Khasra {selectedParcel.khasraNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Primary Landowner</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedParcel.ownerName}</span>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">s/o {selectedParcel.fatherName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Village</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedParcel.village}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">District</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedParcel.district}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Acquisition Area</span>
                  <span className="font-bold text-emerald-800 font-mono">{selectedParcel.areaAcres} Acres</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Status</span>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    selectedParcel.status === 'Acquired' ? 'bg-emerald-100 text-emerald-800' :
                    selectedParcel.status === 'Disputed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedParcel.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Associated Infrastructure Project</span>
                <span className="font-semibold text-blue-900 block">{selectedParcel.projectName}</span>
              </div>

              {/* Compensation Summary */}
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex justify-between items-center text-[11px] text-emerald-900">
                  <span>Base Valuation:</span>
                  <span className="font-mono font-semibold">₹{(selectedParcel.marketValueTotal / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-emerald-900 mt-1">
                  <span>100% Solatium (Sec 30):</span>
                  <span className="font-mono font-semibold">+₹{(selectedParcel.solatiumAmount / 100000).toFixed(2)} Lakh</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs text-emerald-950 mt-2 pt-2 border-t border-emerald-200">
                  <span>Total Award:</span>
                  <span className="font-mono text-sm">₹{(selectedParcel.totalCompensation / 100000).toFixed(2)} Lakh</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/officer/land-parcels/:id', { id: selectedParcel.id })}
                  className="w-full py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Parcel Dossier</span>
                </button>

                <button
                  onClick={() => handleZoomToParcel(selectedParcel)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Center & Zoom in Map</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
