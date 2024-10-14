import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardBody, Button, Select, SelectItem, Checkbox } from "@nextui-org/react"
import { useNavigate, useLocation } from "react-router-dom"
import { reportTemplates } from "../report-templates/reportTemplateConfig"
import { useReportsMetadata } from "../report-templates/hook/useReportsMetadata"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"
import { getMetadata, setMetadata } from "../../service/apis/api"

const CreateReportPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([])
  const [dataSources, setDataSources] = useState<{ id: string; name: string }[]>([])
  const { addReport } = useReportsMetadata()
  const { forms, fetchForms } = useFormMetadata()
  const [appId, setAppId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const appIdParam = params.get("appId")
    if (appIdParam) {
      setAppId(appIdParam)
    }
  }, [location])

  useEffect(() => {
    if (appId) {
      fetchForms()
    }
  }, [appId, fetchForms])

  useEffect(() => {
    const formDataSources = forms.map((form) => ({
      id: form.id,
      name: form.title || `表单 ${form.id}`,
    }))
    setDataSources(formDataSources)
  }, [forms])

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
  }

  const handleDataSourceChange = (values: string[]) => {
    setSelectedDataSources(values)
  }

  const handleCreateReport = async () => {
    if (!selectedTemplate || selectedDataSources.length === 0 || !appId) return

    const newReport = {
      id: Date.now().toString(),
      templateId: selectedTemplate,
      title: `${reportTemplates.find((t) => t.id === selectedTemplate)?.name} - ${new Date().toLocaleString()}`,
      data: {
        dataSources: selectedDataSources,
      },
      status: "draft",
    }

    try {
      await addReport(newReport)
      // 保存报表详细数据
      await setMetadata(`report_${newReport.id}`, JSON.stringify(newReport), appId)
    } catch (error) {
      console.error("Error creating report:", error)
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <Card className='w-full'>
        <CardHeader className='pb-0 pt-2 px-4 flex-col items-start'>
          <h2 className='text-lg font-bold'>创建新报表</h2>
        </CardHeader>
        <CardBody className='overflow-visible py-2'>
          <div className='flex flex-col gap-4'>
            <Select
              label='选择报表模板'
              placeholder='请选择一个模板'
              selectedKeys={selectedTemplate ? [selectedTemplate] : []}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {reportTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label='选择数据源'
              placeholder='请选择数据源'
              selectedKeys={selectedDataSources}
              onSelectionChange={(keys) => handleDataSourceChange(Array.from(keys) as string[])}
              selectionMode='multiple'
            >
              {dataSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </Select>
            <Button
              color='primary'
              onClick={handleCreateReport}
              disabled={!selectedTemplate || selectedDataSources.length === 0}
            >
              创建报表
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default CreateReportPage
