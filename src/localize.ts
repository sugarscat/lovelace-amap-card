import { HomeAssistant } from "custom-card-helpers";
import * as en from "./translations/en.json";
import * as zh_Hans from "./translations/zh-Hans.json";

const languages: Record<string, unknown> = {
  en,
  "zh-Hans": zh_Hans,
};

const DEFAULT_LANG = "en";

function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    return key
      .split(".")
      .reduce((o, i) => (o as Record<string, unknown>)[i], languages[lang]) as string;
  } catch (_) {
    return undefined;
  }
}

export default function setupCustomLocalize(hass?: HomeAssistant) {
  return function (key: string) {
    const lang = hass?.locale.language ?? DEFAULT_LANG;

    let translated = getTranslatedString(key, lang);
    if (!translated) translated = getTranslatedString(key, DEFAULT_LANG);
    return translated ?? key;
  };
}
