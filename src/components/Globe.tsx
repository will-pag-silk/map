import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GamePhase, RoundResult } from '../types';
import { greatCircleArc } from '../utils/scoring';

interface GlobeProps {
  phase: GamePhase;
  pendingGuess: { lat: number; lng: number } | null;
  currentRoundResult: RoundResult | null;
  onGuessPlaced: (lat: number, lng: number) => void;
}

const STYLE_URL = 'https://demotiles.maplibre.org/style.json';

const EMPTY_GEOJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function markerFeature(lng: number, lat: number): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {} }],
  };
}

function arcFeature(result: RoundResult): GeoJSON.FeatureCollection {
  const coords = greatCircleArc(result.guessLat, result.guessLng, result.location.lat, result.location.lng);
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: {},
    }],
  };
}

export function Globe({ phase, pendingGuess, currentRoundResult, onGuessPlaced }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapReadyRef = useRef(false);
  const prevPhaseRef = useRef<GamePhase>(phase);
  const onGuessRef = useRef(onGuessPlaced);
  onGuessRef.current = onGuessPlaced;

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;

    const mapOptions = {
      container: containerRef.current,
      style: STYLE_URL,
      center: [0, 20] as [number, number],
      zoom: 1.5,
      projection: { type: 'globe' },
      attributionControl: false,
    };
    const map = new maplibregl.Map(mapOptions as maplibregl.MapOptions);

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      mapReadyRef.current = true;
      // Uniform country color, no borders or labels
      map.setPaintProperty('countries-fill', 'fill-color', '#d1d5db');
      for (const id of ['countries-boundary', 'countries-label', 'geolines', 'geolines-label']) {
        map.setLayoutProperty(id, 'visibility', 'none');
      }

      // Add sources
      map.addSource('guess-marker', { type: 'geojson', data: EMPTY_GEOJSON });
      map.addSource('target-marker', { type: 'geojson', data: EMPTY_GEOJSON });
      map.addSource('arc-line', { type: 'geojson', data: EMPTY_GEOJSON });

      // Arc layer
      map.addLayer({
        id: 'arc-layer',
        type: 'line',
        source: 'arc-line',
        paint: {
          'line-color': '#facc15',
          'line-width': 2,
          'line-opacity': 0,
          'line-dasharray': [2, 2],
        },
      });

      // Guess marker
      map.addLayer({
        id: 'guess-layer',
        type: 'circle',
        source: 'guess-marker',
        paint: {
          'circle-radius': 10,
          'circle-color': '#3b82f6',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      // Target marker
      map.addLayer({
        id: 'target-layer',
        type: 'circle',
        source: 'target-marker',
        paint: {
          'circle-radius': 10,
          'circle-color': '#ef4444',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0,
          'circle-stroke-opacity': 0,
        },
      });
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Attach/detach click handler based on phase
  useEffect(() => {
    const map = mapRef.current;
    if (!map || phase !== 'guessing') return;

    const handler = (e: maplibregl.MapMouseEvent) => {
      const { lat, lng } = e.lngLat;
      onGuessRef.current(lat, lng);
    };

    map.on('click', handler);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handler);
      map.getCanvas().style.cursor = '';
    };
  }, [phase]);

  // Update guess marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('guess-marker') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData(pendingGuess ? markerFeature(pendingGuess.lng, pendingGuess.lat) : EMPTY_GEOJSON);
  }, [pendingGuess]);

  // Show/hide arc + target on phase change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const arcSrc = map.getSource('arc-line') as maplibregl.GeoJSONSource | undefined;
    const targetSrc = map.getSource('target-marker') as maplibregl.GeoJSONSource | undefined;
    if (!arcSrc || !targetSrc) return;

    if (phase === 'round_result' && currentRoundResult) {
      arcSrc.setData(arcFeature(currentRoundResult));
      targetSrc.setData(markerFeature(currentRoundResult.location.lng, currentRoundResult.location.lat));

      map.setPaintProperty('arc-layer', 'line-opacity', 0.9);
      map.setPaintProperty('target-layer', 'circle-opacity', 1);
      map.setPaintProperty('target-layer', 'circle-stroke-opacity', 1);

      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([currentRoundResult.guessLng, currentRoundResult.guessLat]);
      bounds.extend([currentRoundResult.location.lng, currentRoundResult.location.lat]);
      map.fitBounds(bounds, { padding: 120, duration: 1000 });
    } else if (phase === 'guessing') {
      arcSrc.setData(EMPTY_GEOJSON);
      targetSrc.setData(EMPTY_GEOJSON);
      map.setPaintProperty('arc-layer', 'line-opacity', 0);
      map.setPaintProperty('target-layer', 'circle-opacity', 0);
      map.setPaintProperty('target-layer', 'circle-stroke-opacity', 0);
    }
  }, [phase, currentRoundResult]);

  // Reset view when returning to guessing phase
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (phase === 'guessing' && prev === 'round_result' && mapReadyRef.current) {
      mapRef.current?.flyTo({ center: [0, 20], zoom: 1.5, duration: 1000 });
    }
  }, [phase]);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}
