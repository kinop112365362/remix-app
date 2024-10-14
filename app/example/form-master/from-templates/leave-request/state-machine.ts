export const stateMachine = {
  draft: {
    nextState: "pending_approval",
    action: "提交申请",
  },
  pending_approval: {
    nextState: "approved",
    action: "批准",
  },
  approved: {
    nextState: "archived",
    action: "归档",
  },
  rejected: {
    nextState: "archived",
    action: "归档",
  },
  archived: {
    nextState: null,
    action: null,
  },
}