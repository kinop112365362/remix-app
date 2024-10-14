import { apiService } from "./api"

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

export const getCurrentAccountInfo = async () => {
  const res = await apiService.get(
    `/api/ram-users/self/detail
  `
  )
  return res.data
}
