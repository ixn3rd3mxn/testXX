import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface LatLon {
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-longdo-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #mapContainer
      class="map-container"
      role="application"
      [attr.aria-label]="ariaLabel()"
    ></div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .map-container {
      width: 100%;
      height: 100%;
    }
  `,
})
export class LongdoMapComponent implements OnDestroy {
  readonly zoom = input<number>(9.9);
  readonly zoomRange = input<{ min: number; max: number }>({ min: 9.9, max: 10.9 });
  readonly location = input<LatLon>({ lon: 101.321070, lat: 6.750956 });
  readonly ariaLabel = input<string>('Interactive map');
  /** Semicolon-separated geocode(s) to load as boundary overlays on init, e.g. `'10__'` or `'610604;610607'`. */
  readonly boundaryGeocodes = input<string | null>(null);
  readonly boundaryOptions = input<longdo.BoundaryObjectOptions>({});

  private readonly platformId = inject(PLATFORM_ID);
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private map: longdo.Map | null = null;
  private readonly boundaryObjects = new Map<string, longdo.Overlays.Object>();

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initMap();
        const geocodes = this.boundaryGeocodes();
        if (geocodes) {
          this.loadBoundary(geocodes, this.boundaryOptions());
        }
      }
    });
  }

  private initMap(): void {
    this.map = new longdo.Map({
      placeholder: this.mapContainer().nativeElement,
      // layer: [longdo.Layers['POI_TRANSPARENT'], longdo.Layers['TRAFFIC']],
      zoom: this.zoom(),
      zoomRange: this.zoomRange(),
      location: this.location(),
      // ui: longdo.UiComponent['None'],
      lastView: false,
    });

    const districtColors: Array<{ geocode: string; fillColor: string }> = [
      { geocode: '94__', fillColor: '#ff0000' },
      // { geocode: '94', fillColor: '#0000ff' },
      // { geocode: '9403', fillColor: '#00aa00' },
      // { geocode: '9404', fillColor: '#ff8800' },
      // { geocode: '9405', fillColor: '#aa00aa' },
      // { geocode: '9406', fillColor: '#00aaaa' },
      // { geocode: '9407', fillColor: '#ffcc00' },
      // { geocode: '9408', fillColor: '#ff4488' },
      // { geocode: '9409', fillColor: '#884400' },
      // { geocode: '9410', fillColor: '#0088ff' },
      // { geocode: '9411', fillColor: '#44aa00' },
    ];

    for (const district of districtColors) {
      const obj = new longdo.Overlays.Object(district.geocode, 'IG', {
        simplify: 0.0005,
        combine: true,
        lineColor: '#ff0000',
        fillColor: district.fillColor,
      });
      this.boundaryObjects.set(district.geocode, obj);
      this.map.Overlays.load(obj);
    }
  }

  /**
   * Load a boundary overlay by geocode.
   * @param geocode Geocode string. Use `'10__'` for all Bangkok districts,
   *   or semicolon-separated values like `'610604;610607'` for specific areas.
   * @param options Optional polygon/boundary display options.
   */
  loadBoundary(geocode: string, options?: longdo.BoundaryObjectOptions): void {
    if (!this.map) return;
    const existing = this.boundaryObjects.get(geocode);
    if (existing) {
      this.map.Overlays.unload(existing);
    }
    const obj = new longdo.Overlays.Object(geocode, 'IG', options);
    this.boundaryObjects.set(geocode, obj);
    this.map.Overlays.load(obj);
  }

  /** Remove all overlays (markers, boundaries, etc.) from the map. */
  clearOverlays(): void {
    this.boundaryObjects.clear();
    this.map?.Overlays.clear();
  }

  getMap(): longdo.Map | null {
    return this.map;
  }

  ngOnDestroy(): void {
    this.map = null;
  }
}