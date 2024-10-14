import React, { useEffect, useState } from "react"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"
import { formTemplates } from "../from-templates/formTemplateConfig"
import { Spinner } from "@nextui-org/react"

interface ReadFormRendererProps {
  formId: string
}

const ReadFormRenderer: React.FC<ReadFormRendererProps> = ({ formId }) => {
  const { getFormById, updateForm } = useFormMetadata()
  const [currentForm, setCurrentForm] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadForm(formId)
  }, [formId])

  const loadForm = async (formId: string) => {
    try {
      setLoading(true)
      const formDetails = await getFormById(formId)
      if (formDetails) {
        setCurrentForm(formDetails)
      } else {
        setError("Form not found")
      }
    } catch (err) {
      console.error("Error loading form:", err)
      setError("An error occurred while loading the form")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='w-screen h-screen flex justify-center items-center'>
        <Spinner label='Loading...'></Spinner>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!currentForm) {
    return <div>Form not found</div>
  }

  const template = formTemplates.find((t) => t.id === currentForm.templateId)
  if (!template) {
    console.error("[ReadFormRenderer] Template not found for id:", currentForm.templateId)
    return null
  }

  console.log("[ReadFormRenderer] Rendering form component for template:", template.name)
  const FormComponent = template.readComponent

  return (
    <div className='p-4 min-h-screen'>
      <div className='rounded-lg p-4 bg-black'>
        <FormComponent formId={formId} data={currentForm.data} />
      </div>
    </div>
  )
}

export default ReadFormRenderer
