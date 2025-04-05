import { AMapControl, AMapTheme } from "./types";

export function getMapStyle(theme: AMapTheme) {
  return "amap://styles/" + theme;
}

export function getMapControls(controls: AMapControl[]) {
  // "AMap." + control，并以,分隔;
  return controls.map((control) => "AMap." + control);
}
