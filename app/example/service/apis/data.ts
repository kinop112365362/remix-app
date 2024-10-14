import { apiService } from "./api"

/**
 * 查询数据
 * @param {Object} params - 查询参数
 * @param {string} params.namespace - 命名空间
 * @param {string} params.modelPluralCode - 模型复数代码
 * @param {Array} params.filters - 过滤条件
 *   filters (类型: 数组) - 过滤设置，包含以下属性:
 *   - field (类型: 字符串, 可选) - 字段代码。当过滤操作为 "and" 或 "or" 时为空。
 *   - operator (类型: 字符串, 必需) - 过滤操作。支持 "eq", "ne", "lt", "lte", "gt", "gte", "in", "notIn", "contains", "notContains", "startsWith", "notStartsWith", "endsWith", "notEndsWith", "and", "or", "null", "notNull", "exists", "notExists", "extendField", "json", "simpleArray"。
 *   - value (类型: 字符串, 可选) - 值。字符串、数字、布尔或者数组。
 *   - filters (类型: 数组[对象], 可选) - 当过滤操作为 "and", "or", "exists", "notExists" 时提供子过滤设置，包含以下属性:
 *     - field (类型: 字符串, 可选) - 字段代码。
 *     - operator (类型: 字符串, 可选) - 过滤操作。
 *     - value (类型: 字符串, 可选) - 值。
 *
 *   具体配置规则：
 *   - 逻辑运算： 当 operator 设置为 "or" 或 "and" 时，不需要设置 field 和 value 字段。
 *   - 空值判断运算： 当 operator 设置为 "null" 或 "notNull" 时，不需要设置 value 和 filters 字段。
 *   - 关联对象存在性运算： 当 operator 设置为 "exists" 或 "notExists" 时，不需要设置 value 字段。
 *   - 比较运算： 支持 "eq", "ne", "lt", "lte", "gt", "gte", "in", "notIn" 运算符。
 *   - 字符串匹配运算： 支持 "contains", "notContains", "startsWith", "notStartsWith", "endsWith", "notEndsWith" 运算符。
 *   - 扩展字段查询： 当 operator 设置为 "extendField" 时，当前不需要设置 value、field 字段。
 *   - JSON字段查询： 第一层 operator 为 "json" 代表 JSON 字段查询，第二层 field 为 JSON 字段，支持 "eq", "ne", "contains" 运算符。
 *   - simpleArray字段查询： 第一层 operator 为 "simpleArray" 代表简单数组字段查询，第二层支持 "ne", "eq", "contains", "notContains", "null", "notNull" 运算符。
 *
 *   注意，当包含 2个以上的 fileds，必须设置 operator
 * @param {boolean} params.isPublic - 是否公开
 * @param {number} params.offset - 偏移量
 * @param {number} params.limit - 限制数量
 * @returns {Promise<Object>} 查询结果
 */
export const queryData = async ({
  namespace,
  modelPluralCode,
  filters = [
    {
      field: "id",
      operator: "in",
      value: [],
    },
  ],
  isPublic = true,
  offset = 0,
  limit = 10,
}) => {
  const res = await apiService.post(`/public/data/${namespace}/${modelPluralCode}${isPublic ? "/listpage" : "/find"}`, {
    filters: filters,
    offset,
    limit,
  })
  return res.data
}

/**
 * 批量删除数据
 * @param {Object} params - 删除参数
 * @param {string} params.namespace - 命名空间 模型配置代码中的 namespace
 * @param {string} params.modelPluralCode - 模型配置代码的 pluralCode
 * @param {Array} params.data - 要删除的数据ID列表
 * @returns {Promise<Object>} 删除结果
 */
export const batchDelete = async ({ namespace, modelPluralCode, data }) => {
  const res = await apiService.delete(`/public/data/${namespace}/${modelPluralCode}:batch`, { data })
  return res.data
}

/**
 * 删除单条数据
 * @param {Object} params - 删除参数
 * @param {string} params.namespace - 命名空间
 * @param {string} params.modelPluralCode - 模型复数代码
 * @param {string} params.id - 要删除的数据ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteData = async ({ namespace, modelPluralCode, id }) => {
  const res = await apiService.delete(`/public/data/${namespace}/${modelPluralCode}/${id}`)
  return res.data
}

/**
 * 更新数据
 * @param {Object} params - 更新参数
 * @param {string} params.namespace - 命名空间
 * @param {string} params.modelPluralCode - 模型复数代码
 * @param {Object} params.data - 要更新的数据
 * @returns {Promise<Object>} 更新结果
 */
export const updateData = async ({ namespace, modelPluralCode, data }) => {
  const res = await apiService.patch(`/public/data/${namespace}/${modelPluralCode}/${data.id}`, data)
  return res.data
}

/**
 * 批量插入数据
 * @param {Object} params - 插入参数
 * @param {string} params.namespace - 命名空间
 * @param {string} params.modelPluralCode - 模型复数代码
 * @param {Array} params.data - 要插入的数据列表
 * @returns {Promise<Object>} 插入结果
 */
export const batchInsert = async ({ namespace, modelPluralCode, data }) => {
  const res = await apiService.post(`/public/data/${namespace}/${modelPluralCode}:batch`, { data })
  return res.data
}

/**
 * 插入单条数据
 * @param {Object} params - 插入参数
 * @param {string} params.namespace - 命名空间
 * @param {string} params.modelPluralCode - 模型复数代码
 * @param {Object} params.data - 要插入的数据
 * @returns {Promise<Object>} 插入结果
 */
export const insertData = async ({ namespace, modelPluralCode, data }) => {
  const res = await apiService.post(`/public/data/${namespace}/${modelPluralCode}`, data)
  return res.data
}
