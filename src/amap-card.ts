import { html, LitElement, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import AMapLoader from "@amap/amap-jsapi-loader";
import { AMapCardConfig, AMapTheme } from "./types";
import { getMapControls, getMapStyle } from "./utils";
import setupCustomLocalize from "./localize";

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "amap-card",
  name: "AMap Card",
  description: "AMap Card | 高德地图卡片",
});

@customElement("amap-card")
export class AMapCard extends LitElement implements LovelaceCard {
  static styles = css`
    .amap-card {
      overflow: hidden;
    }
    #amap {
      width: 100%;
      height: 100%;
    }
    .amap-logo {
      display: none !important;
    }
  `;
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
      return nothing;
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

    return html`<ha-card class="amap-card"><div id="amap"></div></ha-card>`;
  }

  private async _loadMap() {
    if (!this._config.key || !this._config.security) {
      console.info("AMap Key or Security code not configured");
      return;
    }

    (window as any)._AMapSecurityConfig = {
      securityJsCode: this._config.security,
    };

    try {
      const AMap = await AMapLoader.load({
        key: this._config.key,
        version: "2.0",
        plugins: getMapControls(this._config.controls),
        Loca: { version: "2.0" },
      });

      this.map = new AMap.Map(this.shadowRoot!.getElementById("amap")!, {
        viewMode: this._config.viewMode,
        zoom: this._config.zoom,
        mapStyle: getMapStyle(this._getTheme()),
        showTraffic: this._config.traffic,
      });

      // 添加实体
      // this._config.entities.forEach((entityId) => {
      //   const stateObj = this.hass!.states[entityId];
      //   if (stateObj && stateObj.attributes.latitude && stateObj.attributes.longitude) {
      //     const marker = new AMap.Marker({
      //       position: [stateObj.attributes.longitude, stateObj.attributes.latitude],
      //       title: stateObj.attributes.friendly_name || entityId,
      //     });
      //     this.map.add(marker);
      //   }
      // });
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
