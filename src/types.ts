import { AMAP_CONTROLS, AMAP_THEMES } from "./const";

export type AMapTheme = (typeof AMAP_THEMES)[number];

export type AMapControl = (typeof AMAP_CONTROLS)[number];

export interface AMapCardConfig {
  type: string;
  lightTheme?: AMapTheme;
  darkTheme?: AMapTheme;
  Key: string;
  security: string;
  traffic: boolean;
  controls: AMapControl[];
  zoom?: number;
  zones?: [];
}
