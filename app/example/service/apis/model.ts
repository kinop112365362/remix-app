import { getAppId, snakeToCamel } from "../../utils"
import { apiService } from "./api"

/**
 * 查询模型列表
 */
export const queryModels = async (params) => {
  const appId = getAppId()
  const res = await apiService.get(`/internal/apps/${appId}/meta/models`, { params })
  return res.data
}

/**
 * 创建模型
 */
export const createModel = async (data) => {
  const _data = {
    ...data,
    singularCode: data.singularCode || data.name,
    namespace: data.namespace || data.name,
    pluralCode: data.pluralCode || data.name + "s",
    tableName: data.tableName || data.name,
  }
  const appId = getAppId()
  const res = await apiService.post(`/internal/apps/${appId}/meta/models`, _data)
  return res.data
}

/**
 * 更新模型
 */
export const updateModel = async (id, data) => {
  const appId = getAppId()
  const res = await apiService.patch(`/internal/apps/${appId}/meta/models/${id}`, data)
  return res.data
}

/**
 * 删除模型
 */
export const deleteModel = async (id) => {
  const appId = getAppId()
  await apiService.delete(`/internal/apps/${appId}/meta/models/${id}`)
}

/**
 * 获取模型详情
 */
export const getModelDetail = async (id) => {
  const appId = getAppId()
  const res = await apiService.get(`/internal/apps/${appId}/meta/models/${id}`)
  return res.data
}

/**
 * 复制模型
 */
export const copyModel = async (id, data) => {
  const appId = getAppId()
  const res = await apiService.post(`/internal/apps/${appId}/meta/models/${id}:copy`, data)
  return res.data
}

/**
 * 创建模型属性
 */
export const createModelProperty = async (data) => {
  const appId = getAppId()
  const _data = {
    ...data,
    code: data.code || snakeToCamel(data.name),
    columnName: data.columnName || data.name,
  }
  const res = await apiService.post(`/internal/apps/${appId}/meta/properties`, _data)
  return res.data
}

/**
 * 查询模型属性列表
 */
export const queryModelProperties = async (modelId) => {
  const appId = getAppId()
  const res = await apiService.get(`/internal/apps/${appId}/meta/properties`, {
    params: {
      modelId,
    },
  })
  return res.data
}

/**
 * 更新模型属性
 */
export const updateModelProperty = async (id, data) => {
  const appId = getAppId()
  const res = await apiService.patch(`/internal/apps/${appId}/meta/properties/${id}`, data)
  return res.data
}

/**
 * 删除模型属性
 */
export const deleteModelProperty = async (id) => {
  const appId = getAppId()
  await apiService.delete(`/internal/apps/${appId}/meta/properties/${id}`)
}

/**
 * 获取模型属性详情
 */
export const getModelPropertyDetail = async (id) => {
  const appId = getAppId()
  const res = await apiService.get(`/internal/apps/${appId}/meta/properties/${id}`)
  return res.data
}

/**
 * 创建模型唯一约束
 */
export const createModelUniqueConstraint = async (data) => {
  const appId = getAppId()
  const res = await apiService.post(`/internal/apps/${appId}/meta/uniqueConstraints`, data)
  return res.data
}

/**
 * 查询模型唯一约束列表
 */
export const queryModelUniqueConstraints = async (params) => {
  const appId = getAppId()
  const res = await apiService.get(`/internal/apps/${appId}/meta/uniqueConstraints`, { params })
  return res.data
}

/**
 * 更新模型唯一约束
 */
export const updateModelUniqueConstraint = async (id, data) => {
  const appId = getAppId()
  const res = await apiService.patch(`/internal/apps/${appId}/meta/uniqueConstraints/${id}`, data)
  return res.data
}

/**
 * 删除模型唯一约束
 */
export const deleteModelUniqueConstraint = async (id) => {
  const appId = getAppId()
  await apiService.delete(`/internal/apps/${appId}/meta/uniqueConstraints/${id}`)
}
