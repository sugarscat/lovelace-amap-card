import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("amap-card")
export class AMapCard extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this._onClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this._onClick);
  }

  private _onClick() {
    this.dispatchEvent(
      new CustomEvent("button-press", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return this.innerHTML;
  }
}
