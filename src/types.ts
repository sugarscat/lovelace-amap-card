import { AMAP_CONTROLS, AMAP_THEMES } from "./const";

export type AMapTheme = (typeof AMAP_THEMES)[number];

export type AMapControl = (typeof AMAP_CONTROLS)[number];

export interface AMapCardConfig {
  type: string;
  Key: string;
  security: string;
  viewMode: "2D" | "3D";
  lightTheme: AMapTheme;
  darkTheme: AMapTheme;
  traffic: boolean;
  controls: AMapControl[];
  zoom: number;
  entities: [];
}
