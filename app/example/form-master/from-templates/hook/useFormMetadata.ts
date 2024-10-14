import { useState, useCallback } from "react"
import { setMetadata, getMetadata, queryMetadataHistory } from "../../../service/apis/api"
import { getCurrentAccountInfo } from "../../../service/apis/user"
import { jsonParse, jsonStringify } from "../../../utils"

interface FormIndex {
  id: string
  templateId: string
  status: string
  title: string
}

interface FormData {
  id: string
  templateId: string
  title: string
  data: any
  status: string
  versionCode: number
  modifiedBy: string // 新增字段
}

export const useFormMetadata = () => {
  const [forms, setForms] = useState<FormData[]>([])

  const fetchForms = useCallback(async () => {
    try {
      const result = await getMetadata(["forms"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        const formIndexes: FormIndex[] = jsonParse(result.data[0].value)

        const formDetailsPromises = formIndexes.map(async (formIndex) => {
          const formDetailResult = await getMetadata([`form_${formIndex.id}`])
          if (formDetailResult.data && formDetailResult.data.length > 0 && formDetailResult.data[0].value) {
            const formData: FormData = jsonParse(formDetailResult.data[0].value)
            return {
              ...formData,
              status: formIndex.status,
              title: formIndex.title,
              versionCode: formDetailResult.data[0].versionCode,
            }
          }
          return null
        })

        const formDetails = await Promise.all(formDetailsPromises)
        const validFormDetails = formDetails.filter((form): form is FormData => form !== null)
        setForms(validFormDetails)
        return validFormDetails
      } else {
        setForms([])
        return []
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setForms([])
      return []
    }
  }, [])

  const addForm = useCallback(async (newForm: FormData) => {
    try {
      // 保存新表单详情
      await setMetadata(`form_${newForm.id}`, jsonStringify(newForm))

      // 获取当前的表单索引
      const result = await getMetadata(["forms"])
      let formIndexes: FormIndex[] = []
      if (result.data && result.data.length > 0 && result.data[0].value) {
        formIndexes = jsonParse(result.data[0].value)
      }

      // 添加新表单到索引，包括 title
      const newFormIndex: FormIndex = {
        id: newForm.id,
        templateId: newForm.templateId,
        status: newForm.status,
        title: newForm.data.title, // 确保包含 title
      }
      formIndexes.push(newFormIndex)

      // 更新表单索引
      await setMetadata("forms", jsonStringify(formIndexes))

      // 更新本地状态
      setForms((prevForms) => [...prevForms, newForm])

      return newForm
    } catch (error) {
      console.error("Error adding form:", error)
      return null
    }
  }, [])

  const deleteForm = useCallback(async (formId: string) => {
    try {
      await setMetadata(`form_${formId}`, "") // Delete the individual form data
      const result = await getMetadata(["forms"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        let formIndexes: FormIndex[] = jsonParse(result.data[0].value)
        formIndexes = formIndexes.filter((form) => form.id !== formId)
        await setMetadata("forms", jsonStringify(formIndexes))
      }
      setForms((prevForms) => prevForms.filter((form) => form.id !== formId))
      return true
    } catch (error) {
      console.error("Error deleting form:", error)
      return false
    }
  }, [])

  const getFormById = useCallback(async (formId: string) => {
    try {
      const formDetailResult = await getMetadata([`form_${formId}`])
      if (formDetailResult.data && formDetailResult.data.length > 0 && formDetailResult.data[0].value) {
        const formData: FormData = jsonParse(formDetailResult.data[0].value)
        return { ...formData, versionCode: formDetailResult.data[0].versionCode }
      }
      return null
    } catch (error) {
      console.error("Error getting form by id:", error)
      return null
    }
  }, [])

  const updateForm = useCallback(async (updatedForm: FormData) => {
    try {
      const currentUser = await getCurrentAccountInfo()
      const formWithModifier = {
        ...updatedForm,
        modifiedBy: currentUser.name || currentUser.email || "Unknown User",
      }
      await setMetadata(`form_${updatedForm.id}`, jsonStringify(formWithModifier))
      const result = await getMetadata(["forms"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        let formIndexes: FormIndex[] = jsonParse(result.data[0].value)
        const index = formIndexes.findIndex((form) => form.id === updatedForm.id)
        if (index !== -1) {
          formIndexes[index] = {
            id: updatedForm.id,
            templateId: updatedForm.templateId,
            status: updatedForm.status,
            title: updatedForm.title,
          }
          await setMetadata("forms", jsonStringify(formIndexes))
        } else {
          formIndexes.push({
            id: updatedForm.id,
            templateId: updatedForm.templateId,
            status: updatedForm.status,
            title: updatedForm.title,
          })
          await setMetadata("forms", jsonStringify(formIndexes))
        }
      }
      setForms((prevForms) => prevForms.map((form) => (form.id === updatedForm.id ? formWithModifier : form)))
      return true
    } catch (error) {
      console.error("Error updating form:", error)
      return false
    }
  }, [])

  const updateFormStatus = useCallback(
    async (formId: string, newStatus: string) => {
      try {
        const form = await getFormById(formId)
        if (form) {
          const updatedForm = { ...form, status: newStatus }
          await updateForm(updatedForm)
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating form status:", error)
        return false
      }
    },
    [getFormById, updateForm]
  )

  const getFormHistory = useCallback(async (names: any) => {
    try {
      const history = await queryMetadataHistory({ names })
      return history.data.map((item: any) => ({
        updatedAt: item.updatedAt,
        status: jsonParse(item.value).status,
        versionCode: item.versionCode,
        modifiedBy: jsonParse(item.value).modifiedBy || "Unknown User",
        value: item.value,
      }))
    } catch (error) {
      console.error("Error fetching form history:", error)
      return []
    }
  }, [])

  return {
    forms,
    fetchForms,
    addForm,
    deleteForm,
    getFormById,
    updateForm,
    updateFormStatus,
    getFormHistory,
    getStatusesByTemplateId,
  }
}

const getStatusesByTemplateId = (templateId) => {
  console.log(templateId)
  switch (templateId) {
    default:
      return [{ value: "Error", label: "未知状态", color: "danger" }]
  }
}
