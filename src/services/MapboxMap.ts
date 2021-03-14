import mapboxgl, { MapboxOptions, Map, LngLatLike } from 'mapbox-gl';
import Deferred from 'my-deferred';
import { ComponentInternalInstance, ref, Ref } from 'vue';

import { MapboxMapInput } from '../classes/MapboxMap';
import { duplicateEvents, filterObject } from './VueHelpers';

export const getStyle = (props:any) => ref({
  height: props.height,
  width: props.width,
  '--zoom-logo': props.zoomLogo >= 0.8 ? props.zoomLogo : 1,
});

export const getMapStyle = (raw:string):string =>
  raw.includes('/') ? raw : `mapbox://styles/mapbox/${raw}`;

export const getMapboxOptions = (props: MapboxMapInput, el: any): MapboxOptions => {
  const opts = filterObject(props, [
    'accessToken',
    'antialias',
    'attributionControl',
    'bearing',
    'bearingSnap',
    'bounds',
    'boxZoom',
    'center',
    'clickTolerance',
    'collectResourceTiming',
    'container',
    'crossSourceCollisions',
    'customAttribution',
    'doubleClickZoom',
    'dragPan',
    'dragRotate',
    'fadeDuration',
    'failIfMajorPerformanceCaveat',
    'fitBoundsOptions',
    'hash',
    'interactive',
    'keyboard',
    'localIdeographFontFamily',
    'logoPosition',
    'maxBounds',
    'maxPitch',    
    'maxTileCacheSize',
    'maxZoom',
    'minPitch',
    'minZoom',
    'pitch',
    'pitchWithRotate',
    'preserveDrawingBuffer',
    'refreshExpiredTiles',
    'renderWorldCopies',
    'scrollZoom',
    'touchZoomRotate',
    'trackResize',
    'transformRequest',
    'zoom',
  ]);

  opts.style = getMapStyle(props.mapStyle);
  opts.container = el;
  return opts;

};

export const mountMap = (props:MapboxMapInput, vmb_map:Deferred<Map>, rootRef: Ref<any>) =>
  (() => {
    const element = rootRef.value;
    const mapOptions = getMapboxOptions(props, element);
    const map = new mapboxgl.Map(mapOptions);

    map.on('load', () => {
      vmb_map.resolve(map);
    });

  })();

export const updateMap = async (vmb_map:Deferred<Map>, props:MapboxMapInput, rootRef: Ref<any>) => {
  const map = await vmb_map.promise;
  const element = rootRef.value;
  const opts = getMapboxOptions(props, element);
  
  if(opts.center)
    map.setCenter(opts.center);
  
  if(typeof opts.bearing === 'number')
    map.setBearing(opts.bearing);  
  if(opts.maxBounds)
    map.setMaxBounds(opts.maxBounds);
  if(typeof opts.maxPitch === 'number')
    map.setMaxPitch(opts.maxPitch);
  if(typeof opts.maxZoom === 'number')
    map.setMaxZoom(opts.maxZoom);
  if(typeof opts.minPitch === 'number')
    map.setMinPitch(opts.minPitch);
  if(typeof opts.pitch === 'number')
    map.setPitch(opts.pitch);
  if(typeof opts.renderWorldCopies === 'boolean')
    map.setRenderWorldCopies(opts.renderWorldCopies);
  if(typeof opts.zoom === 'number')
    map.setZoom(opts.zoom);
};

export const MapEvents = [
  'boxzoomstart',
  'click',
  'contextmenu',
  'data',
  'dataloading',
  'dbclick',
  'drag',
  'dragend',
  'dragstart',
  'error',
  'idle',
  'load',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemouve',
  'mouseout',
  'mouseover',
  'mouseup',
  'move',
  'moveend',
  'movestart',
  'pitch',
  'pitchend',
  'pitchstart',
  'remove',
  'render',
  'resize',
  'rotate',
  'rotateend',
  'rotatestart',
  'sourcedata',
  'sourcedataloading',
  'styledata',
  'styledataloading',
  'styleimagemissing',
  'touchcancel',
  'touchend',
  'touchstart',
  'webglcontextlost',
  'webglcontextrestored',
  'wheel',
  'zoom',
  'zoomend',
  'zoomstart'
];
export const mapEmits = [
  ...MapEvents, 
  'update:center',
  'update:zoom',
  'update:pitch',
];

export const registerMapEvents = async (vmb_map:Deferred<Map>, instance:ComponentInternalInstance) => {
  const map = await vmb_map.promise;
  duplicateEvents<Map>(map, instance, MapEvents);
  
  map.on('zoomend', evt => {
    instance.emit('update:zoom', evt.target.getZoom());
  });

  map.on('dragend', evt => {
    instance.emit('update:center', evt.target.getCenter().toArray());
  });

  map.on('pitchend', evt => {
    instance.emit('update:pitch', evt.target.getPitch());
  });

};