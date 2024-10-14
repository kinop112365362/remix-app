import { apiService } from "./api"

/**
 * 查询我的项目
 * @param {Object} data - 查询参数
 * @returns {Promise<Object>} 项目列表
 */
export const queryMyProject = async (data) => {
  const res = await apiService.get(`/api/projects/self/page`, { params: data })
  return res.data
}

/**
 * 创建项目
 * @param {Object} data - 项目信息
 * @returns {Promise<Object>} 创建结果
 */
export const createProject = async (data) => {
  const res = await apiService.post(`/api/projects`, { ...data, level: "CRITICAL", type: "ENTERPRISE" })
  return res.data
}

/**
 * 更新项目
 * @param {Object} data - 项目信息
 * @returns {Promise<Object>} 更新结果
 */
export const updateProject = async (data) => {
  const res = await apiService.put(`/api/projects/${data.id}`, {
    ...data,
    level: "CRITICAL",
    type: "ENTERPRISE",
  })
  return res.data
}

/**
 * 删除项目
 * @param {string} id - 项目ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteProject = async (id) => {
  const res = await apiService.delete(`/api/projects/${id}`)
  return res.data
}

/**
 * 添加项目成员
 * @param {Object} data - 项目成员数据
 * @returns {Promise<Object>} 添加结果
 */
export const addProjectMember = async (data) => {
  const res = await apiService.post(`/api/project-members`, data)
  return res.data
}

/**
 * 查询项目成员
 * @param {Object} data - 查询参数
 * @returns {Promise<Object>} 查询结果
 */
export const queryProjectMembers = async (data) => {
  const res = await apiService.get(`/api/project-members`, { params: data })
  return res.data
}

/**
 * 更新项目成员
 * @param {Object} data - 项目成员数据
 * @returns {Promise<Object>} 更新结果
 */
export const updateProjectMember = async (data) => {
  const res = await apiService.put(`/api/project-members/${data.id}`, data)
  return res.data
}

/**
 * 禁用项目成员
 * @param {string} id - 成员ID
 * @returns {Promise<Object>} 禁用结果
 */
export const disableProjectMember = async (id) => {
  const res = await apiService.put(`/api/project-members/${id}/disable`)
  return res.data
}
