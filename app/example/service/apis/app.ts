import { apiService } from "./api"

/**
 * 查询我的项目应用
 * @param {Object} data - 查询参数
 * @returns {Promise<Object>} 应用列表
 */
export const queryMyProjectApps = async (data) => {
  const res = await apiService.get(`/api/apps/self/page`, { params: data })
  return res.data
}

/**
 * 更新应用
 * @param {Object} data - 应用信息
 * @returns {Promise<Object>} 更新结果
 */
export const updateApps = async (data) => {
  const res = await apiService.put(`/api/apps/${data.id}`, data)
  return res.data
}

/**
 * 查询应用
 * @param {Object} data - 查询参数
 * @returns {Promise<Object>} 应用列表
 */
export const queryApps = async (data) => {
  const res = await apiService.get(`/api/apps`, { params: data })
  return res.data
}

/**
 * 创建应用
 * @param {Object} data - 应用信息
 * @returns {Promise<Object>} 创建结果
 */
export const createApp = async (data) => {
  const res = await apiService.post(`/api/apps`, {
    ...data,
    type: "CENTRAL_APP",
    developer: 1,
    latestVersion: 1,
    currentDeployVersion: 1,
    scope: "DEV",
  })
  return res.data
}

/**
 * 删除应用
 * @param {string} id - 应用ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteApp = async (id) => {
  const res = await apiService.delete(`/api/apps/${id}`)
  return res.data
}

/**
 * 同步应用
 * @param {Object} data - 同步信息
 * @returns {Promise<Object>} 同步结果
 */
export const syncApp = async (data) => {
  data.startVersion = 1
  data.endVersion = 1
  const res = await apiService.post(`/api/app/upgrade`, data)
  return res.data
}

/**
 * 发布应用
 * @param {Object} data - 发布信息
 * @returns {Promise<Object>} 发布结果
 */
export const releaseApp = async (data) => {
  const res = await apiService.post(`/api/app/release`, data, {
    headers: {
      "x-app": data.appId,
    },
  })
  return res.data
}

/**
 * 发布应用模板
 * @param {Object} data - 模板信息
 * @returns {Promise<Object>} 发布结果
 */
export const pubAppTemplate = async (data) => {
  const res = await apiService.post(`/plat/api/apps/template/release`, {
    appName: data.name,
    appCode: data.appCode + new Date().toISOString(),
    sourceAppId: data.id,
    computePower: data.computePower,
  })
  return res.data
}

/**
 * 查询应用版本
 * @param {string} appId - 应用ID
 * @returns {Promise<Object>} 版本列表
 */
export const queryAppVersions = async (appId) => {
  const res = await apiService.get(`/api/app/versions`, { params: { appId } })
  return res.data
}

/**
 * 查询同步日志详情
 * @param {string} id - 日志ID
 * @returns {Promise<Object>} 日志详情
 */
export const querySyncLogDetails = async (id) => {
  const res = await apiService.get(`/api/app/upgrade-logs/${id}`)
  return res.data
}

/**
 * 禁用应用
 * @param {string} id - 应用ID
 * @returns {Promise<Object>} 禁用结果
 */
export const disableApp = async (id) => {
  const res = await apiService.put(`/api/apps/${id}/disable`)
  return res.data
}

/**
 * 启用应用
 * @param {string} id - 应用ID
 * @returns {Promise<Object>} 启用结果
 */
export const enableApp = async (id) => {
  const res = await apiService.put(`/api/apps/${id}/enable`)
  return res.data
}

/**
 * 查询应用详情
 * @param {string} id - 应用ID
 * @returns {Promise<Object>} 应用详情
 */
export const queryAppDetails = async (id) => {
  const res = await apiService.get(`/api/apps/${id}`)
  return res.data
}

/**
 * 获取应用模板
 * @param {string} name - 模板名称
 * @param {number} limit - 限制数量
 * @returns {Promise<Object>} 模板列表
 */
export const getAppTemplates = async (name = null, limit = 999) => {
  const res = await apiService.get(`/plat/api/apps`, {
    params: { limit, name },
  })
  return res.data
}

/**
 * 克隆平台应用
 * @param {Object} data - 克隆信息
 * @returns {Promise<Object>} 克隆结果
 */
export const clonePlatApp = async (data) => {
  const res = await apiService.post(`/api/apps/clone`, {
    platformAppId: data.id,
    appName: data.name,
    appCode: data.appCode,
    projectId: data.projectId,
  })
  return res.data
}

/**
 * 删除平台应用模板
 * @param {string} id - 模板ID
 * @returns {Promise<Object>} 删除结果
 */
export const deletePlatAppTemplate = async (id) => {
  const res = await apiService.delete(`/plat/api/apps/${id}`)
  return res.data
}
