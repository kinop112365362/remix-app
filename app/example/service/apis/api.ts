import axios from "axios"
import { message } from "../../form-master/Message"
import { blog, getAppId } from "../../utils"

export const modelBaseUserToken = "model-base-user-token"

export const apiService = axios.create({
  // @ts-ignore
  baseURL: __API_BASE_URL__,
  headers: {
    "Content-Type": "application/json",
  },
})

apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(modelBaseUserToken)
    if (token) {
      config.headers["token"] = `${token}`
    }
    const appId = getAppId()
    console.log(appId)
    if (appId) {
      config.headers["x-app"] = appId
      console.log(appId)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    if (error.response) {
      if (error.response.status === 401) {
        message.error("登录过期，请重新登录")
        localStorage.removeItem(modelBaseUserToken)
        window.location.href = `/we-chat-login`
      } else if (error.response.data.code === 400) {
        if (error.response.data.data) {
          message.error(error.response.data.data.message)
        }
        if (error.response.data.message) {
          message.error(error.response.data.message)
        }
      }
    }
    return Promise.reject(error)
  }
)

export * from "./auth"
export * from "./enterprise"
export * from "./user"
export * from "./project"
export * from "./app"
export * from "./role"
export * from "../chat/chat"
export * from "./tenant"
export * from "./data"
export * from "./model"
export * from "./metadata"
