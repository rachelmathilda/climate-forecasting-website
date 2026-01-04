import * as L from 'leaflet';

declare module 'leaflet' {
  type HeatLatLngTuple = [number, number, number];

  interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  interface HeatLayer extends L.TileLayer {
    setOptions(options: HeatMapOptions): HeatLayer;
    addLatLng(latlng: L.LatLng | HeatLatLngTuple): HeatLayer;
    setLatLngs(latlngs: Array<L.LatLng | HeatLatLngTuple>): HeatLayer;
  }

  function heatLayer(
    latlngs: Array<L.LatLng | HeatLatLngTuple>,
    options?: HeatMapOptions
  ): HeatLayer;
}