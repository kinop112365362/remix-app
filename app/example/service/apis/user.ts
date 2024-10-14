import { apiService } from "./api"
import { encrypt } from "./auth"

/**
 * 获取当前账户信息
 * @param {Function} navigate - 路由导航函数
 * @returns {Promise<Object>} 账户信息
 */
export const getCurrentAccountInfo = async () => {
  const res = await apiService.get(`/api/ram-users/self/detail`)
  return res.data
}

/**
 * 创建RAM账户
 * @param {Object} data - 账户信息
 * @returns {Promise<Object>} 创建结果
 */
export const createRamAccount = async (data) => {
  data.password = await encrypt(data.password)
  const res = await apiService.post(`/api/ram-users`, data)
  return res.data
}

/**
 * 查询RAM账户
 * @returns {Promise<Object>} 账户列表
 */
export const queryRamAccount = async () => {
  const res = await apiService.get(`/api/ram-users`)
  return res.data
}

export const deleteRamAccount = async (id) => {
  const res = await apiService.delete(`/api/ram-users/${id}`)
  return res.data
}

export const updateRamAccount = async (id, data) => {
  const res = await apiService.put(`/api/ram-users/${id}`, {
    data,
  })
  return res.data
}

export const queryRamAccountDetail = async (id) => {
  const res = await apiService.get(`/api/ram-users/${id}`)
  return res.data
}
