import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import AMapLoader from "@amap/amap-jsapi-loader";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { wgs84togcj02 } from 'coordtransform';
import { AMapCardConfig, AMapTheme } from "./types";
import { getMapControls, getMapStyle } from "./utils";
import setupCustomLocalize from "./localize";
import { amapCardStyle } from "./styles";
import { AMAP_CONTROLS_POSE } from "./const";

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "amap-card",
  name: "AMap Card",
  description: "高德地图卡片。",
});

@customElement("amap-card")
export class AMapCard extends LitElement implements LovelaceCard {
  static styles = amapCardStyle();

  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private _config!: AMapCardConfig;

  private map?: any;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("amap-card-editor") as LovelaceCardEditor;
  }

  setConfig(config: AMapCardConfig): void {
    this._config = config;
  }

  getCardSize(): number {
    return 4;
  }

  protected firstUpdated() {
    this._loadMap().then();
  }

  protected render() {
    if (!this.hass) {
      return html``;
    }

    const customLocalize = setupCustomLocalize(this.hass);
    if (!this._config) {
      return html`<ha-card>
        <ha-alert alert-type="error">${customLocalize("card.config_not_found")}</ha-alert>
      </ha-card>`;
    }
    if (!this._config.key || !this._config.security) {
      return html`<ha-card>
        <ha-alert alert-type="error">${customLocalize("card.Key_not_found")}</ha-alert>
      </ha-card>`;
    }

    return html`<ha-card class="amap-card"><div id="amap" tabindex="0"></div></ha-card>`;
  }

  private async _loadMap() {
    if (!this._config.key || !this._config.security) {
      console.warn("No key or security key is configured for AMap");
      return;
    }

    (window as any)._AMapSecurityConfig = {
      securityJsCode: this._config.security,
    };

    try {
      const AMap = await AMapLoader.load({
        key: this._config.key,
        version: "2.0",
        plugins: getMapControls(this._config.controls) ?? [],
      });

      this.map = new AMap.Map(this.shadowRoot!.getElementById("amap")!, {
        pitch: this._config.pitch || 30, //地图俯仰角度，有效范围 0 度- 83 度
        viewMode: this._config.viewMode || "2D",
        zoom: this._config.zoom || 12,
        mapStyle: getMapStyle(this._getTheme()) ?? "amap://styles/normal",
        rotateEnable: true, //是否开启地图旋转交互 鼠标右键 + 鼠标画圈移动 或 键盘Ctrl + 鼠标左键画圈移动
        pitchEnable: true, //是否开启地图倾斜交互 鼠标右键 + 鼠标上下移动或键盘Ctrl + 鼠标左键上下移动
        center: [116.397428, 39.90923], //地图中心点
      });

      // 添加控件
      if (this._config.controls.length > 0) {
        this._config.controls.forEach((control) => {
          this.map.addControl(new AMap[control](AMAP_CONTROLS_POSE[control] ?? {}));
        });
      }
      const fitView: any[] = [];
      // 添加实体
      this._config.entities.forEach((entityId) => {
        const stateObj = this.hass!.states[entityId];
        if (stateObj && stateObj.attributes.latitude && stateObj.attributes.longitude) {
          // 转换坐标系
          const [gcjLng, gcjLat] = wgs84togcj02(stateObj.attributes.longitude, stateObj.attributes.latitude);
          // const icon = stateObj.attributes.icon || "mdi:map-marker-radius";
          const marker = new AMap.Marker({
            position: [gcjLng, gcjLat],
            title: stateObj.attributes.friendly_name || entityId,
            // icon: icon,
          });
          // 添加圆形
          const center = new AMap.LngLat(gcjLng, gcjLat);
          const radius = stateObj.attributes.radius || 10;
          const circle = new AMap.Circle({
            center: center, //圆心
            radius: radius, //半径
            borderWeight: 0, //描边的宽度
            strokeColor: "#1791fc", //轮廓线颜色
            strokeOpacity: 0.8, //轮廓线透明度
            strokeWeight: 3, //轮廓线宽度
            fillOpacity: 0.2, //圆形填充透明度
            strokeDasharray: [10, 10],
            fillColor: "#1791fc", //圆形填充颜色
            cursor: "pointer", //鼠标悬停时的鼠标样式
          });
          this.map.add(marker);
          this.map.add(circle);
          fitView.push(circle)
        }
      });
      // 根据覆盖物范围调整视野
      this.map.setFitView(fitView)
    } catch (e) {
      console.error("Failed to load AMap:", e);
    }
  }

  private _getTheme(): AMapTheme {
    // 判断是否自动，根据系统主题切换
    const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isDark ? this._config.darkTheme : this._config.lightTheme;
  }
}
