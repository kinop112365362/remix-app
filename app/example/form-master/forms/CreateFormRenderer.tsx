import React, { useState } from "react"
import { Select, SelectItem } from "@nextui-org/react"
import { formTemplates } from "../from-templates/formTemplateConfig"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"

const CreateFormRenderer: React.FC = () => {
  const { addForm } = useFormMetadata()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSaveForm = async (formData: any) => {
    if (!selectedTemplateId) {
      console.error("[CreateFormRenderer] No template selected for saving form")
      return
    }
    setIsLoading(true)
    console.log("[CreateFormRenderer] Saving form with data:", formData)
    const newForm = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      templateId: selectedTemplateId,
      title: formData.title,
      data: formData,
      status: "draft",
    }
    console.log("[CreateFormRenderer] Creating new form:", newForm)
    await addForm(newForm)
    setIsLoading(false)
  }

  const handleTemplateChange = (templateId: string) => {
    console.log("[CreateFormRenderer] Template changed to:", templateId)
    setSelectedTemplateId(templateId)
  }

  const renderTemplateSelector = () => (
    <Select
      label='选择单据模板'
      placeholder='请选择单据模板'
      className='mb-4'
      onChange={(e) => handleTemplateChange(e.target.value)}
      selectedKeys={selectedTemplateId ? [selectedTemplateId] : []}
    >
      {formTemplates.map((template) => (
        <SelectItem key={template.id} value={template.id}>
          {template.name}
        </SelectItem>
      ))}
    </Select>
  )

  const renderFormComponent = () => {
    if (!selectedTemplateId) return null

    const template = formTemplates.find((t) => t.id === selectedTemplateId)
    if (!template) {
      console.error("[CreateFormRenderer] Template not found for id:", selectedTemplateId)
      return null
    }

    console.log("[CreateFormRenderer] Rendering form component for template:", template.name)
    const FormComponent = template.component

    return <FormComponent onSave={handleSaveForm} isLoading={isLoading} />
  }

  return (
    <div className='p-4 min-h-screen'>
      <div className='rounded-lg p-4 bg-black'>
        {renderTemplateSelector()}
        {renderFormComponent()}
      </div>
    </div>
  )
}

export default CreateFormRenderer
