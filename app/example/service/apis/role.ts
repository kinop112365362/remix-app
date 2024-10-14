import { apiService } from "./api"

const url = ""

/**
 * 创建角色
 * @param {Object} data - 角色信息
 * @returns {Promise<Object>} 创建结果
 */
export const createRole = async (data) => {
  const res = await apiService.post(`/api/roles`, data)
  return res.data
}

/**
 * 查询角色
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 角色列表
 */
export const queryRoles = async (params) => {
  const res = await apiService.get(`/api/roles`, { params })
  return res.data
}

/**
 * 更新角色
 * @param {Object} data - 角色信息
 * @returns {Promise<Object>} 更新结果
 */
export const updateRole = async (data) => {
  const res = await apiService.put(`/api/roles/${data.id}`, data)
  return res.data
}

/**
 * 获取角色详情
 * @param {string} id - 角色ID
 * @returns {Promise<Object>} 角色详情
 */
export const getRoleDetails = async (id) => {
  const res = await apiService.get(`/api/roles/${id}`)
  return res.data
}

/**
 * 禁用角色
 * @param {string} id - 角色ID
 * @returns {Promise<Object>} 禁用结果
 */
export const disableRole = async (id) => {
  const res = await apiService.put(`/api/roles/${id}/disable`)
  return res.data
}

/**
 * 启用角色
 * @param {string} id - 角色ID
 * @returns {Promise<Object>} 启用结果
 */
export const enableRole = async (id) => {
  const res = await apiService.put(`/api/roles/${id}/enable`)
  return res.data
}

/**
 * 删除角色
 * @param {string} id - 角色ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteRole = async (id) => {
  const res = await apiService.delete(`/api/roles/${id}`)
  return res.data
}

/**
 * 根据RAM用户分配角色
 * @param {string} ramUserId - RAM用户ID
 * @param {string[]} roleIds - 角色ID列表
 * @returns {Promise<Object>} 分配结果
 */
export const byRamUser = async (ramUserId, roleIds) => {
  const res = await apiService.post(`/api/user-roles/by-ram-user`, {
    roleIds: roleIds,
    ramUserId,
  })
  return res.data
}
