// 定义状态机
export const stateMachine = {
  initial: {
    nextState: "pending_partner_receipt",
    action: "发送给委托方",
  },
  pending_partner_receipt: {
    nextState: "pending_processing_start",
    action: "确认收货并发送给加工部门",
  },
  pending_processing_start: {
    nextState: "processing",
    action: "开始加工",
  },
  processing: {
    nextState: "pending_our_receipt",
    action: "加工完成并送货",
  },
  pending_our_receipt: {
    nextState: "pending_inspection",
    action: "确认收货并发送给仓库检验",
  },
  pending_inspection: {
    nextState: "pending_payment",
    action: "检验完成并发送给财务",
  },
  pending_payment: {
    nextState: "pending_partner_payment_confirmation",
    action: "已付款并发送给委托方",
  },
  pending_partner_payment_confirmation: {
    nextState: "archived",
    action: "确认收款",
  },
  archived: {
    nextState: null,
    action: null,
  },
}