import { html, LitElement, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import AMapLoader from "@amap/amap-jsapi-loader";
import { AMapCardConfig, AMapTheme } from "./types";
import { getMapControls, getMapStyle } from "./utils";
import setupCustomLocalize from "./localize";
import { AMAP_CONTROLS_POSE } from "./const";

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
      height: 100vh;
    }

    .amap-logo {
      display: none !important;
    }

    html {
      font-size: 12px;
    }

    .amap-copyright {
      box-sizing: content-box;
    }

    * {
      box-sizing: border-box;
    }

    .input-textarea {
      color: grey;
      height: 8em;
      overflow: auto;
      border-radius: 0.4rem;
      border: 1px solid #ced4da;
      margin-bottom: 1rem;
    }

    body {
      margin: 0;
      font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
        "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      line-height: 1.5;
      font-weight: 300;
      color: #111213;
    }

    hr {
      margin: 0.5rem 0;
      box-sizing: content-box;
      height: 0;
      overflow: visible;
      border: 0;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    p {
      margin-top: 0;
      margin-bottom: 0;
    }

    label {
      display: inline-block;
      margin-bottom: 0.4rem;
    }

    label,
    .btn {
      margin-left: 0;
      font-size: 1rem;
    }

    button,
    input,
    select {
      margin: 0;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      overflow: visible;
      text-transform: none;
    }

    [type="button"]::-moz-focus-inner,
    [type="reset"]::-moz-focus-inner,
    [type="submit"]::-moz-focus-inner,
    button::-moz-focus-inner {
      padding: 0;
      border-style: none;
    }

    input[type="checkbox"],
    input[type="radio"] {
      box-sizing: border-box;
      padding: 0;
      -webkit-box-sizing: border-box;
      margin: 0 0.5rem 0 0;
    }

    h4 {
      font-family: inherit;
      line-height: 1.8;
      font-weight: 300;
      color: inherit;
      font-size: 1.1rem;
      margin-top: 0;
      margin-bottom: 0.5rem;
    }

    .btn {
      display: inline-block;
      font-weight: 400;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      transition:
        color 0.15s ease-in-out,
        background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
      background-color: transparent;
      background-image: none;
      color: #25a5f7;
      border-color: #25a5f7;
      padding: 0.25rem 0.5rem;
      line-height: 1.5;
      border-radius: 1rem;
      -webkit-appearance: button;
      cursor: pointer;
    }

    .btn:hover {
      color: #fff;
      background-color: #25a5f7;
      border-color: #25a5f7;
    }

    .btn:hover {
      text-decoration: none;
    }

    .input-item {
      position: relative;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      -ms-flex-align: center;
      align-items: center;
      width: 100%;
      height: 3rem;
    }

    .input-item:last-child {
      margin-bottom: 0;
    }

    .input-item > select,
    .input-item > input[type="text"],
    .input-item > input[type="date"] {
      position: relative;
      -ms-flex: 1 1 auto;
      flex: 1 1 auto;
      width: 1%;
      margin-bottom: 0;
    }

    .input-item > select:not(:last-child),
    .input-item > input[type="text"]:not(:last-child),
    .input-item > input[type="date"]:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .input-item > select:not(:first-child),
    .input-item > input[type="text"]:not(:first-child),
    .input-item > input[type="date"]:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    .input-item-prepend {
      margin-right: -1px;
    }

    .input-item-text,
    input[type="text"],
    input[type="date"],
    select {
      height: calc(2.2rem + 2px);
    }

    .input-item-text {
      width: 6rem;
      text-align: justify;
      padding: 0.4rem 0.7rem;
      display: inline-block;
      text-justify: distribute-all-lines;
      /*ie6-8*/
      text-align-last: justify;
      /* ie9*/
      -moz-text-align-last: justify;
      /*ff*/
      -webkit-text-align-last: justify;
      /*chrome 20+*/
      -ms-flex-align: center;
      align-items: center;
      margin-bottom: 0;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      color: #495057;
      white-space: nowrap;
      background-color: #e9ecef;
      border: 1px solid #ced4da;
      border-radius: 0.25rem 0 0 0.25rem;
    }

    .input-item-text input[type="checkbox"],
    .input-item-text input[type="radio"] {
      margin-top: 0;
    }

    .input-card {
      display: flex;
      flex-direction: column;
      min-width: 0;
      word-wrap: break-word;
      background-color: #fff;
      background-clip: border-box;
      width: 22rem;
      border-width: 0;
      border-radius: 0.4rem;
      box-shadow: 0 2px 6px 0 rgba(114, 124, 245, 0.5);
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      -ms-flex: 1 1 auto;
      flex: 1 1 auto;
      padding: 0.75rem 1.25rem;
    }

    .input-text {
      line-height: 2rem;
      margin-right: 2rem;
    }

    .info hr {
      margin-right: 0;
      margin-left: 0;
      border-top-color: grey;
    }

    .info {
      padding: 0.75rem 1.25rem;
      margin-bottom: 1rem;
      border-radius: 0.25rem;
      position: fixed;
      top: 1rem;
      background-color: white;
      width: auto;
      min-width: 22rem;
      border-width: 0;
      right: 1rem;
      box-shadow: 0 2px 6px 0 rgba(114, 124, 245, 0.5);
    }

    .code {
      left: 1.5rem;
      right: 1.5rem;
      top: 1.5rem;
      bottom: 1.5rem;
      overflow: auto;
      margin-bottom: 0rem;
    }

    .code .btn {
      top: 1rem;
      position: absolute;
      right: 1rem;
    }

    .code .result {
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
      padding: 1rem;
      bottom: 1rem;
      position: absolute;
      top: 5.5rem;
      right: 1rem;
      left: 1rem;
      overflow: auto;
    }

    .code .status {
      color: #80adff;
      display: inline-block;
      font-size: 14px;
    }

    .code h4 {
      display: inline-block;
      max-width: 20rem;
      margin-right: 1rem;
      margin-bottom: 1rem;
    }

    select,
    input[type="text"],
    input[type="date"] {
      display: inline-block;
      width: 100%;
      padding: 0.375rem 1.75rem 0.375rem 0.75rem;
      line-height: 1.5;
      color: #495057;
      vertical-align: middle;
      background: #fff
        url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E")
        no-repeat right 0.75rem center;
      background-size: 8px 10px;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }

    input[type="text"],
    input[type="date"] {
      background: #fff;
      padding: 0.375rem 0.75rem;
    }

    select:focus,
    input[type="text"]:focus,
    input[type="date"]:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.1rem rgba(128, 189, 255, 0.1);
    }

    .btn:focus {
      outline: 0;
      box-shadow: none;
    }

    select:focus::-ms-value,
    input[type="text"]:focus::-ms-value,
    input[type="date"]:focus::-ms-value {
      color: #495057;
      background-color: #fff;
    }

    /* native toastr */

    .native-toast {
      position: fixed;
      background-color: rgba(50, 50, 50, 0.8);
      border-radius: 33px;
      color: white;
      left: 50%;
      text-align: center;
      padding: 6px 12px;
      opacity: 0;
      z-index: 99999;
      transition:
        transform 0.25s,
        opacity 0.25s,
        top 0.25s;
      box-sizing: border-box;
    }

    .native-toast-bottom {
      bottom: 50px;
      -ms-transform: translateX(-50%) translateY(50px);
      transform: translateX(-50%) translateY(50px);
    }

    .native-toast-bottom.native-toast-shown {
      opacity: 1;
      -ms-transform: translateX(-50%) translateY(0);
      transform: translateX(-50%) translateY(0);
    }

    .native-toast-bottom.native-toast-edge {
      bottom: 0;
    }

    .native-toast-top {
      top: 50px;
      -ms-transform: translateX(-50%) translateY(-50px);
      transform: translateX(-50%) translateY(-50px);
    }

    .native-toast-top.native-toast-shown {
      opacity: 1;
      -ms-transform: translateX(-50%) translateY(0);
      transform: translateX(-50%) translateY(0);
    }

    .native-toast-top.native-toast-edge {
      top: 0;
    }

    .native-toast-center {
      top: 0;
      -ms-transform: translateX(-50%) translateY(-50px);
      transform: translateX(-50%) translateY(-50px);
    }

    .native-toast-center.native-toast-shown {
      opacity: 1;
      top: 50%;
      -ms-transform: translateX(-50%) translateY(-50%);
      transform: translateX(-50%) translateY(-50%);
    }

    .native-toast-edge {
      border-radius: 0;
      width: 100%;
      text-align: left;
    }

    @media screen and (min-width: 40rem) {
      .native-toast:not(.native-toast-edge) {
        max-width: 18rem;
      }
    }

    /*
        max-width does not seem to work in small screen?
      */

    /*@media screen and (max-width: 768px) {
        .native-toast:not(.native-toast-edge) {
          max-width: 400px;
        }
      }
      
      @media screen and (max-width: 468px) {
        .native-toast:not(.native-toast-edge) {
          max-width: 300px;
        }
      }*/

    /* types */

    .native-toast-error {
      background-color: #d92727;
      color: white;
    }

    .native-toast-success {
      background-color: #62a465;
      color: white;
    }

    .native-toast-warning {
      background-color: #fdaf17;
      color: white;
    }

    .native-toast-info {
      background-color: #5060ba;
      color: white;
    }

    [class^="native-toast-icon-"] {
      vertical-align: middle;
      margin-right: 8px;
    }

    [class^="native-toast-icon-"] svg {
      width: 16px;
      height: 16px;
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

  // 卸载时执行
  disconnectedCallback() {
    if (this.map) {
      this.map.destroy();
    }
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
        plugins: getMapControls(this._config.controls) ?? [],
      });

      this.map = new AMap.Map(this.shadowRoot!.getElementById("amap")!, {
        viewMode: this._config.viewMode || "2D",
        zoom: this._config.zoom || 12,
        mapStyle: getMapStyle(this._getTheme()) ?? [],
        center: [116.397428, 39.90923], //地图中心点
      });

      // 实时路况图层
      if (this._config.traffic) {
        const trafficLayer = new AMap.TileLayer.Traffic({
          zIndex: 10,
          zooms: [7, 22],
        });
        trafficLayer.show();
      }

      // 添加控件
      if (this._config.controls.length > 0) {
        this._config.controls.forEach((control) => {
          this.map.addControl(new AMap[control](AMAP_CONTROLS_POSE[control] ?? {}));
        });
      }

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
