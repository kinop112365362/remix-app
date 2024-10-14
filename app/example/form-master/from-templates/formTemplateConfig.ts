import OutsourcingProcessingOrderForm from "./outsourcing-processing-order/OutsourcingProcessingOrderForm"
import LeaveRequestForm from "./leave-request/LeaveRequestForm"
import ShataTesterOutsourcingProcessingOrderForm from "./outsourcing-processing-order/ShataTesterOutsourcingProcessingOrderForm"

export interface FormTemplate {
  id: string
  name: string
  component: React.ComponentType<any>
  readComponent: React.ComponentType<any>
}

export const formTemplates: FormTemplate[] = [
  {
    id: "outsourcingProcessingOrder",
    name: "委外加工单",
    component: OutsourcingProcessingOrderForm,
    readComponent: OutsourcingProcessingOrderForm,
  },
  {
    id: "leaveRequest",
    name: "请假单",
    component: LeaveRequestForm,
    readComponent: LeaveRequestForm,
  },
  {
    id: "shataTesterOutsourcingProcessingOrder",
    name: "沙塔测试委外加工单",
    component: ShataTesterOutsourcingProcessingOrderForm,
    readComponent: ShataTesterOutsourcingProcessingOrderForm,
  },
]

export const formTemplatesMap = Object.fromEntries(
  formTemplates.map((template) => [template.id, template.readComponent])
)