declare namespace longdo {
  interface LatLon {
    lon: number;
    lat: number;
  }

  interface MapOptions {
    placeholder: HTMLElement;
    layer?: unknown[];
    zoom?: number;
    zoomRange?: { min: number; max: number };
    location?: LatLon;
    ui?: unknown;
    lastView?: boolean;
  }

  interface BoundaryObjectOptions {
    /** Merge multiple subdistricts into a single object. */
    combine?: boolean;
    /** Boundary detail level: 0.00005 (high) to 0.001 (low). Default: automatic. */
    simplify?: number;
    /** Do not load small fragments of the object. Default: false. */
    ignorefragment?: boolean;
    title?: string;
    /** Text label rendered on the object. */
    label?: string;
    lineColor?: string;
    fillColor?: string | null;
  }

  namespace Overlays {
    /** Boundary object loaded from the Longdo geocode layer (type `'IG'`). */
    class Object {
      constructor(geocode: string, type: 'IG', options?: BoundaryObjectOptions);
    }
  }

  class Map {
    constructor(options: MapOptions);
    zoom(): number;
    zoom(level: number): void;
    location(): LatLon;
    location(latlon: LatLon, animate?: boolean): void;
    resize(): void;
    Overlays: {
      /** Add a regular overlay (Marker, Polygon, Polyline, etc.). Counterpart: `remove()`. */
      add(overlay: unknown): void;
      /** Remove a regular overlay previously added with `add()`. Does NOT work on boundary objects — use `unload()` instead. */
      remove(overlay: unknown): void;
      /** Load a boundary object (e.g. created with `longdo.Overlays.Object`). Counterpart: `unload()`. */
      load(overlay: longdo.Overlays.Object): void;
      /** Remove a boundary object previously loaded with `load()`. */
      unload(overlay: longdo.Overlays.Object): void;
      clear(): void;
    };
  }

  class Marker {
    constructor(
      location: LatLon,
      options?: { title?: string; icon?: { url: string; offset?: { x: number; y: number } } }
    );
  }

  const Layers: Record<string, unknown>;
  const UiComponent: Record<string, unknown>;
}

declare const longdo: {
  Map: typeof longdo.Map;
  Marker: typeof longdo.Marker;
  Layers: typeof longdo.Layers;
  UiComponent: typeof longdo.UiComponent;
  Overlays: typeof longdo.Overlays;
};