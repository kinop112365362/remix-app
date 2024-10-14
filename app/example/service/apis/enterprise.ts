import { encrypt } from "./auth"
import { apiService } from "./api"

/**
 * 创建企业
 * @param {Object} data - 企业信息
 * @returns {Promise<Object>} 创建结果
 */
export const createEnterPrise = async (data) => {
  data.password = await encrypt(data.password)
  data.organizationPhone = data.phone
  const res = await apiService.post(`/public/api/organizations`, data, {
    headers: {
      "X-CODE": data.smsCode,
      "X-PHONE": data.phone,
    },
  })
  return res.data
}

/**
 * 删除企业
 * @param {string} id - 企业ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteEnterPrise = async (id) => {
  const res = await apiService.delete(`/public/api/organizations/${id}`)
  return res.data
}

/**
 * 查询平台企业列表
 * @returns {Promise<Object>} 企业列表
 */
export const queryPlatEnterPriseList = async () => {
  const res = await apiService.get(`/plat/api/organizations`)
  return res.data
}

/**
 * 查询企业列表
 * @param {string} name - 企业名称
 * @returns {Promise<Object>} 企业列表
 */
export const queryEnterPriseList = async (name) => {
  const res = await apiService.get(`/public/api/organizations`, {
    params: { name, limit: 5 },
  })
  return res.data
}

/**
 * 查询当前企业信息
 * @returns {Promise<Object>} 企业信息
 */
export const queryCurrentEnterPrise = async () => {
  const res = await apiService.get(`/api/organizations/self/detail`)
  return res.data
}

/**
 * 更新企业信息
 * @param {Object} data - 企业信息
 * @returns {Promise<Object>} 更新结果
 */
export const updateTenantsInfo = async (data) => {
  const res = await apiService.put(`/api/organizations/self`, data)
  return res.data
}
