import ProcessingReport from "./outsourcing-processing-order-chart/ProcessingReport"
import ShataTesterProcessingReport from "./outsourcing-processing-order-chart/ShataTesterProcessingReport"

export interface ReportTemplate {
  id: string
  name: string
  component: React.ComponentType<any>
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: "processingChart",
    name: "委外加工报表",
    component: ProcessingReport,
  },
  {
    id: "shataTesterProcessingChart",
    name: "沙塔测试委外加工报表",
    component: ShataTesterProcessingReport,
  },
  // 可以在这里添加更多的报表模板
]

export const reportTemplatesMap = Object.fromEntries(
  reportTemplates.map((template) => [template.id, template.component])
)