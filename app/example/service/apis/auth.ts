import { apiService } from "./api"
import { modelBaseUserToken } from "./api"

export const encrypt = async (password) => {
  const publicKeyRes = await getPublicKey()
  const pubKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyRes}\n-----END PUBLIC KEY-----`
  const en = new window.JSEncrypt()
  en.setPublicKey(pubKey)
  return en.encrypt(password)
}

/**
 * 获取公钥
 * @returns {Promise<string>} 公钥
 */
export const getPublicKey = async () => {
  const res = await apiService.get(`/public/api/public-key`)
  return res.data.key
}

/**
 * 登录
 * @param {Object} data - 登录信息
 * @param {string} data.organizationId - 组织ID
 * @param {string} data.account - 账号
 * @param {string} data.password - 密码
 * @returns {Promise<string|Object>} 登录结果
 */
export const login = async (data) => {
  const password = await encrypt(data.password)
  const res = await apiService.post(`/public/api/login`, {
    organizationId: data.organizationId,
    account: data.account,
    password,
  })
  localStorage.setItem(modelBaseUserToken, res.data.tokenValue)
  return res.data.tokenValue ? "has token" : res.data
}

/**
 * 修改密码
 * @param {string} oldPassword - 旧密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<Object>} 修改结果
 */
export const changePassword = async (oldPassword, newPassword) => {
  const oldPass = await encrypt(oldPassword)
  const newPass = await encrypt(newPassword)
  const res = await apiService.put(`/api/ram-users/password/self`, {
    oldPassword: oldPass,
    newPassword: newPass,
  })
  return res.data
}

/**
 * 发送短信验证码
 * @param {string} phone - 手机号
 * @returns {Promise<Object>} 发送结果
 */
export const smsCaptcha = async (phone) => {
  const res = await apiService.post(`/public/api/sms/captcha`, {
    scenario: "organization_signup",
    phone,
  })
  return res.data
}

export const loginOut = async () => {
  await apiService.post(`/plat/api/logout`)
}
