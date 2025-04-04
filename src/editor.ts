import { html, LitElement, nothing } from "lit";
import { AMapCardConfig } from "./types";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { customElement, property, state } from "lit/decorators.js";
import setupCustomLocalize from "./localize";
import { themes } from "./const";

@customElement("amap-card-editor")
export class AMapCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: AMapCardConfig;
  @state() private theTheme = "auto";

  setConfig(config: AMapCardConfig): void {
    this._config = { ...config };
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

  private _themeChange = (ev: CustomEvent) => {
    this.theTheme = ev.detail.value;
    switch (ev.detail.value) {
      case "auto":
        break;
      default:
        this._config!.lightTheme = this._config!.darkTheme = ev.detail.value;
    }
  };

  private _appearanceConfigHtml(customLocalize: any) {
    return html`
      <collapsible-section themeIcon="mdi:theme" lable="${customLocalize("editor.theme.label")}">
        <div class="dropdown-container">
          <mwc-select
            label="${customLocalize("editor.theme.mode.auto")}"
            .value=${this.theTheme}
            @change=${this._themeChange}
          >
            <mwc-list-item value="auto"
              >${customLocalize("editor.theme.options.auto")}</mwc-list-item
            >
            ${themes.map(
              (theme) => html`
                <mwc-list-item value="${theme}"
                  >${customLocalize("editor.theme.options." + theme)}</mwc-list-item
                >
              `
            )}
          </mwc-select>
          <mwc-select
            label="${customLocalize("editor.theme.mode.light")}"
            .value=${this._config?.lightTheme}
            .configValue=${"lightTheme"}
            @change="${this._valueChanged}"
            ?disabled=${this.theTheme !== "auto"}
          >
            ${themes.map(
              (theme) => html`
                <mwc-list-item value="${theme}"
                  >${customLocalize("editor.theme.options." + theme)}</mwc-list-item
                >
              `
            )}
          </mwc-select>
          <mwc-select
            label="${customLocalize("editor.theme.mode.dark")}"
            .value=${this._config?.darkTheme}
            .configValue=${"darkTheme"}
            @change="${this._valueChanged}"
            ?disabled=${this.theTheme !== "auto"}
          >
            ${themes.map(
              (theme) => html`
                <mwc-list-item value="${theme}"
                  >${customLocalize("editor.theme.options." + theme)}</mwc-list-item
                >
              `
            )}
          </mwc-select>
        </div>
        <ha-switch
          ?checked="${this._config?.traffic !== false}"
          .configValue="${"traffic"}"
          @change="${this._valueChanged}"
        ></ha-switch>
        <mwc-formfield label="控件"> </mwc-formfield>
      </collapsible-section>
    `;
  }

  private _apiKeyConfigHtml(customLocalize: any) {
    return html`
      <ha-formfield label="${customLocalize("editor.entity.label")}">
        <paper-input
          label="${customLocalize("editor.zoom.label")}"
          .value=${this._config?.zoom}
          .configValue=${"key"}
          @input=${this._valueChanged}
        ></paper-input>
        <paper-input
          label="${customLocalize("editor.zoom.label")}"
          .value=${this._config?.zoom}
          .configValue=${"security"}
          @input=${this._valueChanged}
        ></paper-input>
      </ha-formfield>
    `;
  }

  private _entityConfigHtml(customLocalize: any) {
    return html`
      <ha-formfield label="${customLocalize("editor.entity.label")}">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config?.entities}
          .includeDomains=${["device_tracker", "zone"]}
          allow-custom-entity
          multiple
          @value-changed=${this._valueChanged}
        ></ha-entity-picker>
      </ha-formfield>
    `;
  }

  protected render() {
    if (!this.hass) {
      return nothing;
    }

    const customLocalize = setupCustomLocalize(this.hass);

    return html` <ha-form class="card-config">
      <paper-input
        label="${customLocalize("editor.zoom.label")}"
        .value=${this._config?.zoom}
        .configValue=${"zoom"}
        @input=${this._valueChanged}
      ></paper-input>
    </ha-form>`;
  }
}
