import { AMapControl, AMapTheme } from "./types";

export const getMapStyle = (theme: AMapTheme) => {
  return "amap://styles/" + theme;
};

export const getMapControls = (controls: AMapControl[]) => {
  // "AMap." + control，并以,分隔;
  return controls.map((control) => "AMap." + control).join(",");
};
