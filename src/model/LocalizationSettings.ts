import Model from "../data/Model"
import Key, { ModelKey } from "../data/Key"

export const languageCodes = ["en", "fr", "es", "zh", "de"]
type LanguageProperties = { name: string, code: string }
export const LanguageObj: { [code: string]: LanguageProperties | undefined } = { 
    en: {name: "English", code: "en" },
    fr: {name: "French", code: "fr" }, 
    es: {name: "Spanish", code: "es" }, 
    zh: {name: "Chinese", code: "zh" }, 
    de: {name: "German", code: "de" }
}

export default class LocalizationSettings extends Model {

    @Model.property({ enum: languageCodes, default: "en" })
    languageCode!: string

    // we store this setting in local storage
    static store: "local"

    static key: ModelKey<LocalizationSettings>
}

LocalizationSettings.key = Key.create(LocalizationSettings, "0")