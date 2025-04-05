import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { AMapCardConfig } from "./types";
import { AMAP_CONTROLS, AMAP_THEMES } from "./const";
import setupCustomLocalize from "./localize";

export const defaultConfig: AMapCardConfig = {
  key: "",
  type: "",
  security: "",
  lightTheme: "normal",
  darkTheme: "dark",
  controls: ["ToolBar", "Geolocation"],
  traffic: false,
  viewMode: "2D",
  zoom: 15,
  entities: [],
};

@customElement("amap-card-editor")
export class AMapCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: AMapCardConfig;

  setConfig(config: AMapCardConfig): void {
    this._config = {
      ...defaultConfig,
      ...config,
    };
  }

  protected render() {
    if (!this.hass || !this._config) return html``;
    const customLocalize = setupCustomLocalize(this.hass);
    const schema: any[] = [
      {
        name: "key",
        selector: { text: {} },
        required: true,
        label: customLocalize("editor.api.key"),
        value: this._config.key || "",
      },
      {
        name: "security",
        selector: { text: {} },
        required: true,
        label: customLocalize("editor.api.security"),
        value: this._config.security || "",
      },
      {
        name: "lightTheme",
        type: "select",
        options: AMAP_THEMES.map((item) => [
          item,
          customLocalize("editor.appearance.theme.options." + item),
        ]),
        label: customLocalize("editor.appearance.theme.mode.light"),
        value: this._config.lightTheme || "",
      },
      {
        name: "darkTheme",
        type: "select",
        options: AMAP_THEMES.map((item) => [
          item,
          customLocalize("editor.appearance.theme.options." + item),
        ]),
        label: customLocalize("editor.appearance.theme.mode.dark"),
        value: this._config.darkTheme || "",
      },
      {
        name: "viewMode",
        selector: { select: { options: ["2D", "3D"] } },
        label: customLocalize("editor.appearance.viewMode"),
        value: this._config.viewMode || "2D",
      },
      {
        name: "controls",
        type: "multi_select",
        options: AMAP_CONTROLS.reduce((acc: Record<string, string>, item) => {
          acc[item] = customLocalize("editor.appearance.control." + item);
          return acc;
        }, {}),
        label: customLocalize("editor.appearance.control.title"),
        value: this._config.controls || [],
      },
      {
        name: "traffic",
        selector: { boolean: {} },
        label: customLocalize("editor.appearance.traffic"),
        value: this._config.traffic ?? false,
      },
      {
        name: "zoom",
        selector: {
          number: { min: 3, max: 20, step: 1, mode: "slider" },
        },
        label: customLocalize("editor.appearance.zoom"),
        value: this._config.zoom || 12,
      },
      {
        name: "entities",
        selector: { entity: { multiple: true, domain: "zone" } },
        label: customLocalize("editor.entity"),
        value: this._config.entities || [],
      },
    ];

    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .schema=${schema}
          .data=${this._config}
          .computeLabel=${(schema: any) => schema.label}
          @value-changed=${this._handleValueChanged}
        ></ha-form>
      </div>
    `;
  }

  private _handleValueChanged(ev: CustomEvent) {
    this._config = ev.detail.value as AMapCardConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
      })
    );
  }
}
