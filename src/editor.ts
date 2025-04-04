import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { AMapCardConfig, AMapControl, AMapTheme } from "./types";
import setupCustomLocalize from "./localize";
import { AMAP_CONTROLS, AMAP_THEMES } from "./const";

const defaultConfig: AMapCardConfig = {
  type: "amap-card",
  lightTheme: "normal",
  darkTheme: "dark",
  controls: ["ToolBar", "Geolocation"],
  Key: "",
  security: "",
  traffic: false,
  zoom: 15,
  zones: [],
};

@customElement("amap-card-editor")
export class AMapCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: AMapCardConfig;
  @state() private theTheme = "auto";

  setConfig(config: AMapCardConfig): void {
    this._config = { ...defaultConfig, ...config };
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;

    const customLocalize = setupCustomLocalize(this.hass);

    return html`
      <ha-form class="card-config">
        <ha-formfield label="${customLocalize("editor.entity.label")}">
          <paper-input
            label="${customLocalize("editor.key.label")}"
            .value=${this._config.Key}
            .configValue=${"Key"}
            @input=${this._valueChanged}
          ></paper-input>
          <paper-input
            label="${customLocalize("editor.security.label")}"
            .value=${this._config.security}
            .configValue=${"security"}
            @input=${this._valueChanged}
          ></paper-input>
        </ha-formfield>

        <ha-expansion-panel themeIcon="mdi:theme" header="${customLocalize("editor.theme.label")}">
          <div class="dropdown-container">
            <ha-select
              label="${customLocalize("editor.theme.mode.auto")}"
              .value=${this.theTheme}
              @selected=${this._themeChange}
            >
              <mwc-list-item value="auto">
                ${customLocalize("editor.theme.options.auto")}
              </mwc-list-item>
              ${AMAP_THEMES.map(
                (theme) => html`
                  <mwc-list-item value="${theme}">
                    ${customLocalize("editor.theme.options." + theme)}
                  </mwc-list-item>
                `
              )}
            </ha-select>

            <ha-select
              label="${customLocalize("editor.theme.mode.light")}"
              .value=${this._config.lightTheme}
              .configValue=${"lightTheme"}
              @selected=${this._valueChanged}
              ?disabled=${this.theTheme !== "auto"}
            >
              ${AMAP_THEMES.map(
                (theme) => html`
                  <mwc-list-item value="${theme}">
                    ${customLocalize("editor.theme.options." + theme)}
                  </mwc-list-item>
                `
              )}
            </ha-select>

            <ha-select
              label="${customLocalize("editor.theme.mode.dark")}"
              .value=${this._config.darkTheme}
              .configValue=${"darkTheme"}
              @selected=${this._valueChanged}
              ?disabled=${this.theTheme !== "auto"}
            >
              ${AMAP_THEMES.map(
                (theme) => html`
                  <mwc-list-item value="${theme}">
                    ${customLocalize("editor.theme.options." + theme)}
                  </mwc-list-item>
                `
              )}
            </ha-select>
          </div>

          <ha-switch
            .checked=${this._config.traffic}
            .configValue=${"traffic"}
            @change=${this._valueChanged}
          ></ha-switch>

          <label>${customLocalize("editor.control.label")}</label>
          ${AMAP_CONTROLS.map(
            (item) => html`
              <ha-formfield .label=${customLocalize("editor.control.options." + item)}>
                <ha-checkbox
                  .checked=${this._config?.controls.includes(item)}
                  .value=${item}
                  @change=${this._handleControlsChange}
                ></ha-checkbox>
              </ha-formfield>
            `
          )}

          <paper-input
            label="${customLocalize("editor.zoom.label")}"
            .value=${this._config.zoom}
            .configValue=${"zoom"}
            @input=${this._valueChanged}
          ></paper-input>
        </ha-expansion-panel>

        <ha-formfield label="${customLocalize("editor.entity.label")}">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.zones}
            .includeDomains=${["zone"]}
            allow-custom-entity
            multiple
            @value-changed=${this._zonesChanged}
          ></ha-entity-picker>
        </ha-formfield>
      </ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target as any;
    if (target.configObject[target.configAttribute] == target.value) {
      return;
    }
    if (target.configAdd && target.value !== "") {
      target.configObject = Object.assign(target.configObject, {
        [target.configAdd]: { [target.configAttribute]: target.value },
      });
    }
    if (target.configAttribute && target.configObject && !target.configAdd) {
      if (target.value == "" || target.value === false) {
        if (target.ignoreNull == true) return;
        delete target.configObject[target.configAttribute];
      } else {
        target.configObject[target.configAttribute] = target.value;
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _zonesChanged(ev: CustomEvent) {
    this._config = {
      ...this._config!,
      zones: ev.detail.value,
    };
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _themeChange(ev: CustomEvent) {
    this.theTheme = ev.detail.value;
    if (this.theTheme !== "auto") {
      this._config = {
        ...this._config!,
        lightTheme: this.theTheme as AMapTheme,
        darkTheme: this.theTheme as AMapTheme,
      };
      fireEvent(this, "config-changed", { config: this._config });
    }
  }

  private _handleControlsChange(e: Event) {
    const checkbox = e.target as HTMLInputElement;
    const value = checkbox.value as AMapControl;
    const checked = checkbox.checked;

    const newControls = checked
      ? [...(this._config?.controls ?? []), value]
      : (this._config?.controls.filter((v) => v !== value) ?? []);

    this._config = {
      ...this._config!,
      controls: [...new Set(newControls)],
    };

    fireEvent(this, "config-changed", { config: this._config });
  }
}
