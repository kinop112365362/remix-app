import React, { useState, useEffect, useMemo } from "react"
import {
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react"
import { getMetadata } from "../../../service/apis/api"
import { useFormMetadata } from "../hook/useFormMetadata"
import FormHistoryTable from "../../forms/FormHistoryTable"
import { Icon } from "@iconify/react"
import { stateMachine } from "./state-machine"
import StatusFlowChart from "./StatusFlowChart"

interface ShataTesterOutsourcingProcessingOrderFormProps {
  formId: string
  templateId: string
}

const ShataTesterOutsourcingProcessingOrderForm: React.FC<ShataTesterOutsourcingProcessingOrderFormProps> = ({
  formId,
  templateId,
}) => {
  const { getFormById, updateForm, updateFormStatus, addForm } = useFormMetadata()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormModified, setIsFormModified] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [material, setMaterial] = useState<any[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [approvalComment, setApprovalComment] = useState("")

  useEffect(() => {
    fetchForm()
    fetchSuppliers()
    fetchMaterial()
  }, [formId])

  useEffect(() => {
    if (form) {
      validateForm()
    }
  }, [form])

  const fetchForm = async () => {
    try {
      setLoading(true)
      const formData = await getFormById(formId)
      if (formData) {
        setForm(formData)
        setApprovalComment(formData.data.approvalComment || "")
      } else {
        // 初始化新表单
        setForm({
          id: generateOrderNumber(),
          templateId: "shataTesterOutsourcingProcessingOrder",
          status: "draft",
          data: {
            title: "新沙塔测试委外加工单", // 添加默认标题
            orderNumber: generateOrderNumber(),
            manufacturerCode: "",
            manufacturerName: "",
            manufacturerAddress: "",
            manufacturerContact: "",
            manufacturerContactPerson: "",
            orderDate: new Date().toISOString().split("T")[0],
            expectedDeliveryDate: "",
            items: [],
            totalAmount: 0,
            notes: "",
            approvalComment: "",
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

  const fetchSuppliers = async () => {
    try {
      const result = await getMetadata(["simulated_supplier_info"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        setSuppliers(JSON.parse(result.data[0].value))
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const fetchMaterial = async () => {
    try {
      const result = await getMetadata(["simulated_material_list"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        setMaterial(JSON.parse(result.data[0].value))
      }
    } catch (error) {
      console.error("Error fetching material:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (form?.status === "archived") return
    const { name, value } = e.target
    setForm((prev: any) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }))
    setIsFormModified(true)
    validateField(name, value)
  }

  const handleManufacturerChange = (value: string) => {
    if (form?.status === "archived") return
    const selectedManufacturer = suppliers.find((s) => s["厂商编号"] === value)
    if (selectedManufacturer) {
      setForm((prev: any) => ({
        ...prev,
        data: {
          ...prev.data,
          manufacturerCode: selectedManufacturer["厂商编号"],
          manufacturerName: selectedManufacturer["厂商名称"],
          manufacturerAddress: selectedManufacturer["地址"],
          manufacturerContact: selectedManufacturer["联系方式"],
          manufacturerContactPerson: selectedManufacturer["联系人"],
          title: `${selectedManufacturer["厂商名称"]}委外加工单`, // 更新标题
        },
      }))
      setIsFormModified(true)
      validateField("manufacturerCode", selectedManufacturer["厂商编号"])
    }
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    if (form?.status === "archived" || (field !== "数量" && field !== "单价" && field !== "物料名称")) return
    setForm((prev: any) => {
      const newItems = [...(prev.data.items || [])]
      newItems[index] = { ...newItems[index], [field]: value }
      if (field === "数量" || field === "单价") {
        newItems[index]["总价"] = Number(newItems[index]["数量"]) * Number(newItems[index]["单价"])
      }
      if (field === "物料名称") {
        const selectedMaterial = material.find((m) => m["物料名称"] === value)
        if (selectedMaterial) {
          newItems[index] = {
            ...newItems[index],
            物料名称: selectedMaterial["物料名称"],
            规格: selectedMaterial["规格"],
            单位: selectedMaterial["单位"],
          }
        }
      }
      const totalAmount = newItems.reduce((sum, item) => sum + (item["总价"] || 0), 0)
      return {
        ...prev,
        data: {
          ...prev.data,
          items: newItems,
          totalAmount: totalAmount,
        },
      }
    })
    setIsFormModified(true)
    validateItems(form.data.items)
  }

  const handleDeleteItem = (index: number) => {
    if (form?.status === "archived") return
    setForm((prev: any) => {
      const newItems = [...prev.data.items]
      newItems.splice(index, 1)
      const totalAmount = newItems.reduce((sum, item) => sum + (item["总价"] || 0), 0)
      return {
        ...prev,
        data: {
          ...prev.data,
          items: newItems,
          totalAmount: totalAmount,
        },
      }
    })
    setIsFormModified(true)
    validateItems(form.data.items)
  }

  const validateField = (name: string, value: string | number) => {
    let error = ""
    switch (name) {
      case "title":
        error = value ? "" : "Title is required"
        break
      case "orderNumber":
        error = value ? "" : "Invalid order number format"
        break
      case "manufacturerCode":
        error = value ? "" : "Manufacturer is required"
        break
      case "orderDate":
        error = value ? "" : "Order date is required"
        break
      case "expectedDeliveryDate":
        error = value ? "" : "Expected delivery date is required"
        break
      default:
        break
    }
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const validateItems = (items: any[]) => {
    const itemErrors = items.map((item) => ({
      物料名称: item["物料名称"] ? "" : "Material name is required",
      数量: item["数量"] > 0 ? "" : "Quantity must be greater than 0",
      单价: item["单价"] > 0 ? "" : "Unit price must be greater than 0",
    }))
    setErrors((prev) => ({ ...prev, items: itemErrors }))
  }

  const validateForm = () => {
    if (!form || !form.data) return

    validateField("title", form.data.title)
    validateField("orderNumber", form.data.orderNumber)
    validateField("manufacturerCode", form.data.manufacturerCode)
    validateField("orderDate", form.data.orderDate)
    validateField("expectedDeliveryDate", form.data.expectedDeliveryDate)
    validateItems(form.data.items)

    const isValid =
      !errors.title &&
      !errors.orderNumber &&
      !errors.manufacturerCode &&
      !errors.orderDate &&
      !errors.expectedDeliveryDate &&
      form.data.items.every((item: any) => item["物料名称"] && item["数量"] > 0 && item["单价"] > 0)

    setIsFormValid(isValid)
  }

  const handleCreateForm = async () => {
    if (form?.status !== "draft" || !isFormModified || !isFormValid) return
    try {
      const updatedForm = {
        ...form,
        status: "initial",
        data: {
          ...form.data,
          approvalComment: approvalComment,
        },
      }
      await addForm(updatedForm)
      setForm(updatedForm)
      setIsFormModified(false)
      await fetchForm()
    } catch (error) {
      console.error("Error saving form data:", error)
      setError("An error occurred while saving the form")
    }
  }

  const handleStateTransition = async () => {
    if (form?.status === "archived" || !isFormValid) return
    const currentState = form.status
    const nextState = stateMachine[currentState].nextState
    if (nextState) {
      try {
        const updatedForm = {
          ...form,
          status: nextState,
          data: {
            ...form.data,
            approvalComment: approvalComment,
          },
        }
        await updateFormStatus(form.id, nextState)
        await updateForm(updatedForm)
        setForm(updatedForm)
        fetchForm()
      } catch (error) {
        console.error("Error updating form status:", error)
        setError("An error occurred while updating the form status")
      }
    }
  }

  const renderActionButton = () => {
    const currentState = form?.status
    if (currentState && stateMachine[currentState]) {
      const { action } = stateMachine[currentState]
      if (action) {
        return (
          <Button color='primary' onClick={handleStateTransition} disabled={!isFormValid}>
            {action}
          </Button>
        )
      }
    }
    return null
  }

  const generateOrderNumber = () => {
    const prefix = "OPO"
    const timestamp = Date.now().toString().slice(-6)
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}${timestamp}${randomNum}`
  }

  const addItem = () => {
    if (form?.status === "archived") return
    setForm((prev: any) => ({
      ...prev,
      data: {
        ...prev.data,
        items: [
          ...prev.data.items,
          {
            物料名称: "",
            规格: "",
            单位: "",
            数量: 0,
            加工工序: "",
            单价: 0,
            总价: 0,
            交期: "",
          },
        ],
      },
    }))
    setIsFormModified(true)
    validateItems(form.data.items)
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
    <form className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          label='单据标题'
          name='title'
          value={form.data?.title || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={form.status !== "draft"}
          errorMessage={errors.title}
          isInvalid={!!errors.title}
        />
        <Input
          label='订单编号'
          name='orderNumber'
          value={form.data?.orderNumber || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={form.status !== "draft"}
          errorMessage={errors.orderNumber}
          isInvalid={!!errors.orderNumber}
        />
        <Select
          label='厂商'
          selectedKeys={[`${form.data?.manufacturerCode}`]}
          onSelectionChange={(keys) => handleManufacturerChange(Array.from(keys)[0] as string)}
          className='w-full'
          isDisabled={form.status !== "draft"}
          errorMessage={errors.manufacturerCode}
          isInvalid={!!errors.manufacturerCode}
        >
          {suppliers.map((supplier) => (
            <SelectItem key={supplier["厂商编号"]} value={supplier["厂商编号"]}>
              {supplier["厂商名称"]}
            </SelectItem>
          ))}
        </Select>
        <Input
          label='厂商编号'
          name='manufacturerCode'
          value={form.data?.manufacturerCode || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={true}
        />
        <Input
          label='地址'
          name='manufacturerAddress'
          value={form.data?.manufacturerAddress || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={true}
        />
        <Input
          label='联系方式'
          name='manufacturerContact'
          value={form.data?.manufacturerContact || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={true}
        />
        <Input
          label='联系人'
          name='manufacturerContactPerson'
          value={form.data?.manufacturerContactPerson || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={true}
        />
        <Input
          type='date'
          label='订单日期'
          name='orderDate'
          value={form.data?.orderDate || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={form.status !== "draft"}
          errorMessage={errors.orderDate}
          isInvalid={!!errors.orderDate}
        />
        <Input
          type='date'
          label='预计交货日期'
          name='expectedDeliveryDate'
          value={form.data?.expectedDeliveryDate || ""}
          onChange={handleInputChange}
          className='w-full'
          isReadOnly={form.status !== "draft"}
          errorMessage={errors.expectedDeliveryDate}
          isInvalid={!!errors.expectedDeliveryDate}
        />
      </div>

      <Table aria-label='委外加工单明细' className='mt-4'>
        <TableHeader>
          <TableColumn isRowHeader>物料名称</TableColumn>
          <TableColumn isRowHeader>规格</TableColumn>
          <TableColumn isRowHeader>单位</TableColumn>
          <TableColumn isRowHeader>数量</TableColumn>
          <TableColumn isRowHeader>加工工序</TableColumn>
          <TableColumn isRowHeader>单价</TableColumn>
          <TableColumn isRowHeader>总价</TableColumn>
          <TableColumn isRowHeader>交期</TableColumn>
          <TableColumn isRowHeader>操作</TableColumn>
        </TableHeader>
        <TableBody>
          {form.data?.items?.map((item: any, index: number) => (
            <TableRow key={index}>
              <TableCell className='min-w-24'>
                <Select
                  value={item["物料名称"]}
                  selectedKeys={[item["物料名称"]]}
                  onChange={(e) => handleItemChange(index, "物料名称", e.target.value)}
                  className='w-full'
                  isDisabled={form.status !== "draft"}
                >
                  {material.map((m) => (
                    <SelectItem key={m["物料名称"]} value={m["物料名称"]}>
                      {m["物料名称"]}
                    </SelectItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>{item["规格"]}</TableCell>
              <TableCell>{item["单位"]}</TableCell>
              <TableCell className='min-w-5'>
                <Input
                  type='number'
                  value={item["数量"]}
                  onChange={(e) => handleItemChange(index, "数量", Number(e.target.value))}
                  className='w-full'
                  isReadOnly={form.status !== "draft"}
                />
              </TableCell>
              <TableCell>{item["加工工序"]}</TableCell>
              <TableCell>
                <Input
                  type='number'
                  value={item["单价"]}
                  onChange={(e) => handleItemChange(index, "单价", Number(e.target.value))}
                  className='w-full'
                  isReadOnly={form.status !== "draft"}
                />
              </TableCell>
              <TableCell>{item["总价"].toFixed(2)}</TableCell>
              <TableCell>{item["交期"]}</TableCell>
              <TableCell>
                {form.status === "draft" && (
                  <Button
                    isIconOnly
                    color='danger'
                    variant='light'
                    onPress={() => handleDeleteItem(index)}
                    aria-label='Delete item'
                  >
                    <Icon icon='mdi:delete' width='20' height='20' />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {form.status === "draft" && (
        <Button onClick={addItem} color='primary'>
          添加物料
        </Button>
      )}

      <div className='flex justify-end mt-6'>
        <div>总金额：¥{form.data?.totalAmount?.toFixed(2) || "0.00"}</div>
      </div>

      <Input
        label='备注'
        name='notes'
        value={form.data?.notes || ""}
        onChange={handleInputChange}
        className='w-full mt-4'
        isReadOnly={form.status === "archived"}
      />

      <Textarea
        label='审批意见'
        value={approvalComment}
        onChange={(e) => setApprovalComment(e.target.value)}
        className='w-full mt-4'
        isReadOnly={form.status === "archived"}
      />

      {form.status !== "draft" && <FormHistoryTable formId={formId} />}

      {form.status !== "draft" && <StatusFlowChart currentStatus={form.status} />}

      <div className='flex justify-end mt-6 space-x-4'>
        {form.status === "draft" ? (
          <Button color='primary' onClick={handleCreateForm} disabled={!isFormModified || !isFormValid}>
            创建单据
          </Button>
        ) : (
          renderActionButton()
        )}
      </div>
    </form>
  )
}

export default ShataTesterOutsourcingProcessingOrderForm