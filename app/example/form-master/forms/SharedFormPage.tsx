import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"
import { formTemplatesMap } from "../from-templates/formTemplateConfig"

const SharedFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { getFormById, updateFormStatus, getStatusesByTemplateId } = useFormMetadata()
  const [form, setForm] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchForm()
  }, [id])

  const fetchForm = async () => {
    if (!id) {
      setError("No form ID provided")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const formData = await getFormById(id)
      if (formData) {
        setForm(formData)
      } else {
        setError("Form not found")
      }
    } catch (error) {
      console.error("Error fetching form:", error)
      setError("An error occurred while fetching the form")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus && form) {
      try {
        await updateFormStatus(form.id, newStatus)
        setForm((prevForm: any) => ({ ...prevForm, status: newStatus }))
        console.log("Form status updated successfully")
      } catch (error) {
        console.error("Error updating form status:", error)
        setError("An error occurred while updating the form status")
      }
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner size='lg' />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card>
          <CardBody>
            <p className='text-center text-large'>{error || "Form not found"}</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  const FormComponent = formTemplatesMap[form.templateId as keyof typeof formTemplatesMap]

  if (!FormComponent) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card>
          <CardBody>
            <p className='text-center text-large'>Unsupported form template</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <Card className='w-full'>
        <CardHeader className='flex justify-between items-center p-4'>
          <h1 className='text-2xl font-bold'>{form.title}</h1>
          {/* <p className='text-sm'>
            单据状态: {getStatusesByTemplateId(form.templateId).find((s) => s.value === form.status)?.label}
          </p> */}
        </CardHeader>
        <CardBody>
          <FormComponent formId={id} templateId={form.templateId} onStatusChange={handleStatusChange} />
        </CardBody>
      </Card>
    </div>
  )
}

export default SharedFormPage
