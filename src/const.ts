import { AMapCardConfig } from "./types";

export const themes = [
  "normal", // 标准
  "dark", // 幻影黑
  "light", // 月光银
  "whitesmoke", // 远山黛
  "fresh", // 草色青
  "grey", // 雅士灰
  "graffiti", // 涂鸦
  "macaron", // 马卡龙
  "blue", // 靛青蓝
  "darkblue", // 极夜蓝
  "wine", // 酱籽
];

export const controls = [
  "ToolBar", // 缩放控件
  "Scale", // 比例尺控件
  "ControlBar", // 控制罗盘控件
  "Geolocation", // 定位控件
  "HawkEye", // 鹰眼控件
  "MapType", // 图层切换控件
];

export const defaultConfig: AMapCardConfig = {
  type: "amap-card",
  lightTheme: "normal",
  darkTheme: "dark",
  Key: "",
  security: "",
  traffic: false,
  zoom: 15,
  entities: [],
};
