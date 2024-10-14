import React, { useState, useEffect } from "react"
import {
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@nextui-org/react"
import { useFormMetadata } from "../hook/useFormMetadata"
import FormHistoryTable from "../../forms/FormHistoryTable"
import StatusFlowChart from "./StatusFlowChart"

interface LeaveRequestFormProps {
  formId: string
  templateId: string
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ formId, templateId }) => {
  const { getFormById, updateForm, updateFormStatus } = useFormMetadata()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormModified, setIsFormModified] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      setLoading(true)
      const formData = await getFormById(formId)
      if (formData) {
        setForm(formData)
      } else {
        // Initialize new form
        setForm({
          id: generateLeaveRequestId(),
          templateId: "leaveRequest",
          status: "draft",
          data: {
            employeeName: "",
            employeeId: "",
            leaveType: "",
            startDate: "",
            endDate: "",
            reason: "",
            approverComments: "",
          },
        })
      }
    } catch (error) {
      console.error("Error fetching form:", error)
      setError("An error occurred while fetching the form")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev: any) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }))
    setIsFormModified(true)
  }

  const handleSelectChange = (value: string, name: string) => {
    setForm((prev: any) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }))
    setIsFormModified(true)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      // Update form status to pending_approval
      const updatedForm = {
        ...form,
        status: "pending_approval",
      }
      await updateForm(updatedForm)
      setForm(updatedForm)
      setIsFormModified(false)
      // Trigger state transition
      await handleStateTransition("pending_approval")
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("An error occurred while submitting the form")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    await handleStateTransition("approved")
  }

  const handleReject = async () => {
    await handleStateTransition("rejected")
  }

  const handleArchive = async () => {
    await handleStateTransition("archived")
  }

  const handleStateTransition = async (nextState: string) => {
    try {
      setLoading(true)
      const updatedForm = {
        ...form,
        status: nextState,
        data: {
          ...form.data,
          approverComments: form.data.approverComments,
        },
      }
      await updateForm(updatedForm)
      await updateFormStatus(form.id, nextState)
      setForm(updatedForm)
      await fetchForm()
    } catch (error) {
      console.error("Error updating form status:", error)
      setError("An error occurred while updating the form status")
    } finally {
      setLoading(false)
    }
  }

  const renderActionButtons = () => {
    const currentState = form?.status
    if (currentState === "pending_approval") {
      return (
        <>
          <Button color="success" onClick={handleApprove} disabled={loading}>
            批准
          </Button>
          <Button color="danger" onClick={handleReject} disabled={loading}>
            拒绝
          </Button>
        </>
      )
    } else if (currentState === "rejected" || currentState === "approved") {
      return (
        <Button color="primary" onClick={handleArchive} disabled={loading}>
          归档
        </Button>
      )
    }
    return null
  }

  const generateLeaveRequestId = () => {
    const prefix = "LR"
    const timestamp = Date.now().toString().slice(-6)
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}${timestamp}${randomNum}`
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!form) {
    return <div>Form not found</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">请假申请表</h2>
      </CardHeader>
      <CardBody>
        <form className="space-y-4">
          <Input
            label="员工姓名"
            name="employeeName"
            value={form.data.employeeName}
            onChange={handleInputChange}
            isRequired
          />
          <Input
            label="员工ID"
            name="employeeId"
            value={form.data.employeeId}
            onChange={handleInputChange}
            isRequired
          />
          <Select
            label="请假类型"
            name="leaveType"
            selectedKeys={[form.data.leaveType]}
            onChange={(e) => handleSelectChange(e.target.value, "leaveType")}
            isRequired
          >
            <SelectItem key="annual" value="annual">年假</SelectItem>
            <SelectItem key="sick" value="sick">病假</SelectItem>
            <SelectItem key="personal" value="personal">事假</SelectItem>
          </Select>
          <Input
            label="开始日期"
            name="startDate"
            type="date"
            value={form.data.startDate}
            onChange={handleInputChange}
            isRequired
          />
          <Input
            label="结束日期"
            name="endDate"
            type="date"
            value={form.data.endDate}
            onChange={handleInputChange}
            isRequired
          />
          <Textarea
            label="请假原因"
            name="reason"
            value={form.data.reason}
            onChange={handleInputChange}
            isRequired
          />
          {form.status !== "draft" && (
            <>
              <Divider />
              <Textarea
                label="审批意见"
                name="approverComments"
                value={form.data.approverComments}
                onChange={handleInputChange}
                isDisabled={form.status === "archived" || form.status === "approved" || form.status === "rejected"}
              />
            </>
          )}
          <div className="flex justify-end space-x-2">
            {form.status === "draft" ? (
              <Button color="primary" onClick={handleSubmit} disabled={!isFormModified || loading}>
                {loading ? "提交中..." : "提交申请"}
              </Button>
            ) : (
              renderActionButtons()
            )}
          </div>
        </form>
        {form.status !== "draft" && <FormHistoryTable formId={formId} />}
        <StatusFlowChart currentStatus={form.status} />
      </CardBody>
    </Card>
  )
}

export default LeaveRequestForm