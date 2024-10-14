import { apiService } from "./api"

/**
 * 创建租户
 * @param {Object} data - 租户信息
 * @returns {Promise<Object>} 创建结果
 */
export const createTenant = async (data) => {
  const res = await apiService.post(`/plat/api/organizations`, data)
  return res.data
}

/**
 * 删除租户
 * @param {string} id - 租户ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteTenant = async (id) => {
  const res = await apiService.delete(`/plat/api/organizations/${id}`)
  return res.data
}

/**
 * 查询租户列表
 * @param {Object} data - 查询参数
 * @returns {Promise<Object>} 租户列表
 */
export const queryTenants = async (data) => {
  const res = await apiService.get(`/plat/api/organizations`, { params: { limit: 999 } })
  return res.data
}

//交易-统一收单下单并支付页面
export const pagePay = async ({ orderId, returnUrl }) => {
  const res = await apiService.post(`/api/trades/page-pay`, { orderId, returnUrl })
  return res.data
}

//商品-分页列表
export const products = async () => {
  const res = await apiService.get(`/public/api/products`)
  return res.data
}

//创建订单
export const orders = async ({ productId, quantity, paymentMethod }) => {
  const res = await apiService.post(`/api/orders`, { productId, quantity, paymentMethod })
  return res.data
}

//查询算力账户详情
export const getAccount = async () => {
  const res = await apiService.get(`/api/compute-accounts/detail`)
  return res.data
}
