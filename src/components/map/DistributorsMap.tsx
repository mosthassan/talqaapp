'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DistributorPoint } from '@/src/types';
import { isDistributorOpenNow } from '@/src/data/distributors';

interface DistributorsMapProps {
  distributors: DistributorPoint[];
  selectedId?: string | null;
  onSelectDistributor?: (distributor: DistributorPoint) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export default function DistributorsMap({
  distributors,
  selectedId,
  onSelectDistributor,
  userCoords,
}: DistributorsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Ma'rib city center
      const initialCenter: [number, number] = [15.459, 45.326];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap Tiles (standard, cached via SW)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Custom Brand DivIcon Creator
    const createCustomIcon = (isSelected: boolean, isOpen: boolean) => {
      const bgGradient = isSelected
        ? 'linear-gradient(135deg, #F5D061, #D4AF37, #B38212)'
        : 'linear-gradient(135deg, #0284C7, #0369A1)';
      const statusDotColor = isOpen ? '#10B981' : '#EF4444';

      const html = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgGradient}; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <span style="position: absolute; top: -1px; right: -1px; width: 9px; height: 9px; border-radius: 50%; background: ${statusDotColor}; border: 1.5px solid #ffffff;"></span>
        </div>
      `;

      return L.divIcon({
        className: 'talqa-custom-marker',
        html,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });
    };

    // User location icon (Blue pulsing dot)
    if (userCoords) {
      const userHtml = `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(2, 132, 199, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 4px; border-radius: 50%; background: #0284C7; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'talqa-user-marker',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div style="font-family: inherit; font-size: 11px; text-align: right; padding: 2px;"><b>موقعك الحالي</b></div>');
    }

    // Add Distributor Markers
    distributors.forEach((dist) => {
      const isSelected = dist.id === selectedId;
      const isOpen = isDistributorOpenNow(dist);
      const icon = createCustomIcon(isSelected, isOpen);

      const marker = L.marker([dist.lat, dist.lng], { icon }).addTo(map);

      const statusBadge = isOpen
        ? '<span style="color: #059669; background: #D1FAE5; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: bold;">مفتوح الآن</span>'
        : '<span style="color: #DC2626; background: #FEE2E2; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: bold;">مغلق حالياً</span>';

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dist.lat},${dist.lng}`;

      const popupHtml = `
        <div dir="rtl" style="font-family: system-ui, sans-serif; text-align: right; min-width: 190px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <h4 style="margin: 0; font-size: 13px; font-weight: bold; color: #1C1917;">${dist.name}</h4>
            ${statusBadge}
          </div>
          <p style="margin: 2px 0 6px; font-size: 11px; color: #57534E;">${dist.neighborhood}</p>
          <div style="font-size: 10px; color: #78716C; margin-bottom: 8px; border-top: 1px dashed #E7E5E4; padding-top: 4px;">
            الساعات: ${dist.openHours}
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #C59424; color: #ffffff; padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none;">
              الاتجاهات ↗
            </a>
            <a href="tel:${dist.phone.replace(/\s+/g, '')}" style="background: #E0F2FE; color: #0369A1; padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none;">
              اتصال
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectDistributor) {
          onSelectDistributor(dist);
        }
      });

      markersRef.current[dist.id] = marker;

      if (isSelected) {
        marker.openPopup();
        map.setView([dist.lat, dist.lng], 15, { animate: true });
      }
    });

    // Fit bounds if we have points and nothing specifically selected
    if (distributors.length > 0 && !selectedId) {
      const group = L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [distributors, selectedId, onSelectDistributor, userCoords]);

  return (
    <div className="relative w-full h-[260px] sm:h-[320px] rounded-[20px] overflow-hidden border border-[#E7E5E4] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md text-[9px] text-[#57534E] border border-[#E7E5E4] pointer-events-none">
        خريطة مأرب • OpenStreetMap
      </div>
    </div>
  );
}
