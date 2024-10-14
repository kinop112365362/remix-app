import { localDB } from "./localDB"
import { message } from "@/components/Message"
import { modelConfig } from "@/pages/mo/DevChatModelConfig"
import { t } from "i18next"

export const checkApiKey = (selectedRole: any) => {
  if (!selectedRole) {
    message.error(t("selected_role_not_found"))
    return false
  }

  const baseModel = selectedRole.baseModel||""
  const apiKeyName = modelConfig.models[baseModel]?.apiKeyName

  if (!apiKeyName) {
    message.error(t("base_model_not_configured"))
    return false
  }

  // 如果是 deepseek 或 anthropic 模型，不进行 API key 检查
  if (baseModel === "deepseek" || baseModel === "anthropic") {
    return true
  }

  const apiKeys = localDB.getItem("apiKeys") || {}
  const apiKey = apiKeys[apiKeyName]

  if (!apiKey) {
    message.error(t("api_key_not_configured", { model: baseModel }))
    return false
  }

  return true
}