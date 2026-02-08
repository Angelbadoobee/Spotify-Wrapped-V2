declare module 'react-simple-maps' {
  import { ComponentType, SVGProps, ReactNode } from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (data: {
      geographies: any[];
      outline: any;
      borders: any;
    }) => ReactNode;
    parseGeographies?: (geographies: any) => any[];
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: any;
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement>) => void;
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<any>;
  export const Annotation: ComponentType<any>;
  export const Line: ComponentType<any>;
  export const Graticule: ComponentType<any>;
  export const Sphere: ComponentType<any>;
  export const ZoomableGroup: ComponentType<any>;
}
