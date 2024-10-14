import React, { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Chip,
  useDisclosure,
  ModalFooter,
  Tabs,
  Tab,
  ScrollShadow,
} from "@nextui-org/react"
import { motion, AnimatePresence } from "framer-motion"
import { useFormMetadata } from "./from-templates/hook/useFormMetadata"
import { useReportsMetadata } from "./report-templates/hook/useReportsMetadata"
import { useNavigate } from "react-router-dom"
import { formTemplates } from "@/components/form-master/from-templates/formTemplateConfig"
import { Icon } from "@iconify/react"
import ProjectAppSelector from "./forms/ProjectAppSelector"
import CreateResourceButton from "./resource/CreateResourceButton"
import ResourceList from "./resource/ResourceList"

const FormsPage: React.FC = () => {
  const { forms, fetchForms, deleteForm, updateFormStatus, getStatusesByTemplateId } = useFormMetadata()
  const { reports, fetchReports, deleteReport } = useReportsMetadata()
  const navigate = useNavigate()

  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure()
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("forms")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (selectedAppId) {
      fetchForms()
      fetchReports()
    }
  }, [fetchForms, fetchReports, selectedAppId])

  const handleCreateForm = () => {
    if (!selectedAppId) return
    console.log("[FormsPage] Creating new form")
    window.open(`/forms/create?appId=${selectedAppId}`, "_blank")
  }

  const handleEditForm = async (form: any) => {
    if (!selectedAppId) return
    console.log("[FormsPage] Editing form:", form)
    window.open(`/forms/edit/${form.id}?appId=${selectedAppId}`, "_blank")
  }

  const handleDeleteForm = async (formId: string) => {
    console.log("[FormsPage] Deleting form:", formId)
    setFormToDelete(formId)
    onDeleteConfirmOpen()
  }

  const confirmDeleteForm = async () => {
    if (formToDelete) {
      setDeletingFormId(formToDelete)
    }
    try {
      await deleteForm(formToDelete || "undefined")
      await fetchForms()
    } catch (error) {
      console.error("Error deleting form:", error)
    } finally {
      setDeletingFormId(null)
      onDeleteConfirmClose()
      setFormToDelete(null)
    }
  }

  const handleViewForm = (formId: string) => {
    if (!selectedAppId) return
    console.log("[FormsPage] Viewing form:", formId)
    window.open(`/forms/${formId}?appId=${selectedAppId}`, "_blank")
  }

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("x-app-id")
    sessionStorage.removeItem("x-project-id")
    navigate("/we-chat-login")
  }

  const handleAIAnalysis = () => {
    window.open(`/forms/analysis?appId=${sessionStorage.getItem("x-app-id")}`, "_blank")
  }

  const handleRefreshForms = async () => {
    if (!selectedAppId) return
    setIsRefreshing(true)
    try {
      await fetchForms()
    } catch (error) {
      console.error("Error refreshing forms:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshResources = async () => {
    if (!selectedAppId) return
    setIsRefreshing(true)
    try {
      console.log("[FormsPage] Refreshing resources")
    } catch (error) {
      console.error("Error refreshing resources:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshReports = async () => {
    if (!selectedAppId) return
    setIsRefreshing(true)
    try {
      await fetchReports()
    } catch (error) {
      console.error("Error refreshing reports:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateReport = () => {
    if (!selectedAppId) return
    console.log("[FormsPage] Creating new report")
    window.open(`/reports/create?appId=${selectedAppId}`, "_blank")
  }

  const handleDeleteReport = async (reportId: string) => {
    console.log("[FormsPage] Deleting report:", reportId)
    try {
      await deleteReport(reportId)
      await fetchReports()
    } catch (error) {
      console.error("Error deleting report:", error)
    }
  }

  const handleViewReport = (reportId: string) => {
    if (!selectedAppId) return
    console.log("[FormsPage] Viewing report:", reportId)
    window.open(`/reports/view/${reportId}?appId=${selectedAppId}`, "_blank")
  }

  console.log("[FormsPage] Current forms state:", forms)
  console.log("[FormsPage] Current reports state:", reports)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='w-full mx-auto p-4'
    >
      <div className='flex flex-col mb-4'>
        <ProjectAppSelector onAppSelect={handleAppSelect} />
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key.toString())}>
        <Tab key='forms' title='智能单据'>
          <div className='flex flex-nowrap gap-2 mb-4'>
            <Button
              color='primary'
              onClick={handleCreateForm}
              startContent={<span className='icon-[mdi--plus] w-5 h-5' />}
              className='flex-[2]'
              isDisabled={!selectedAppId}
            >
              创建单据
            </Button>
            <Button
              color='secondary'
              onClick={handleAIAnalysis}
              startContent={<Icon icon='mingcute:ai-line' width='20' height='20' />}
              className='flex-[1]'
            >
              AI 分析
            </Button>
            <Button
              color='default'
              onClick={handleRefreshForms}
              startContent={<Icon icon='mdi:refresh' width='20' height='20' />}
              className='flex-[1]'
              isDisabled={!selectedAppId || isRefreshing}
            >
              刷新
            </Button>
          </div>

          <ScrollShadow className='h-[calc(100vh-300px)] overflow-y-auto'>
            <AnimatePresence>
              <motion.div
                className='space-y-4'
                initial='hidden'
                animate='visible'
                exit='hidden'
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {forms.map((form) => (
                  <motion.div
                    key={form.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className='w-full shadow-md hover:shadow-lg transition-shadow duration-300'>
                      <CardHeader className='flex flex-col items-start bg-gray-50 p-3'>
                        <div className='flex items-center justify-between w-full mb-2'>
                          <h4 className='text-lg font-semibold text-primary'>
                            {form.title || `${formTemplates.find((t) => t.id === form.templateId)?.name}`}
                          </h4>
                        </div>
                      </CardHeader>
                      <CardBody className='p-3'>
                        <div className='flex space-x-2'>
                          <Button
                            size='sm'
                            color='primary'
                            variant='light'
                            onClick={() => handleViewForm(form.id)}
                            isIconOnly
                          >
                            <Icon icon='mdi:eye' width='18' height='18' />
                          </Button>
                          <Button
                            size='sm'
                            color='danger'
                            variant='light'
                            onClick={() => handleDeleteForm(form.id)}
                            isIconOnly
                            isLoading={deletingFormId === form.id}
                          >
                            <Icon icon='mdi:delete' width='18' height='18' />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </ScrollShadow>
        </Tab>
        <Tab key='reports' title='智能报表'>
          <div className='flex flex-nowrap gap-2 mb-4'>
            <Button
              color='primary'
              onClick={handleCreateReport}
              startContent={<span className='icon-[mdi--plus] w-5 h-5' />}
              className='flex-[2]'
              isDisabled={!selectedAppId}
            >
              创建报表
            </Button>
            <Button
              color='default'
              onClick={handleRefreshReports}
              startContent={<Icon icon='mdi:refresh' width='20' height='20' />}
              className='flex-[1]'
              isDisabled={!selectedAppId || isRefreshing}
            >
              刷新
            </Button>
          </div>
          <ScrollShadow className='h-[calc(100vh-300px)] overflow-y-auto'>
            <AnimatePresence>
              <motion.div
                className='space-y-4'
                initial='hidden'
                animate='visible'
                exit='hidden'
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className='w-full shadow-md hover:shadow-lg transition-shadow duration-300'>
                      <CardHeader className='flex flex-col items-start bg-gray-50 p-3'>
                        <div className='flex items-center justify-between w-full mb-2'>
                          <h4 className='text-lg font-semibold text-primary'>{report.title}</h4>
                        </div>
                      </CardHeader>
                      <CardBody className='p-3'>
                        <div className='flex space-x-2'>
                          <Button
                            size='sm'
                            color='primary'
                            variant='light'
                            onClick={() => handleViewReport(report.id)}
                            isIconOnly
                          >
                            <Icon icon='mdi:eye' width='18' height='18' />
                          </Button>
                          <Button
                            size='sm'
                            color='danger'
                            variant='light'
                            onClick={() => handleDeleteReport(report.id)}
                            isIconOnly
                          >
                            <Icon icon='mdi:delete' width='18' height='18' />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </ScrollShadow>
        </Tab>
        <Tab key='resources' title='基础资料'>
          <div className='flex flex-nowrap gap-2 mb-4'>
            <CreateResourceButton appId={selectedAppId} isDisabled={!selectedAppId} />
            <Button
              color='default'
              onClick={handleRefreshResources}
              startContent={<Icon icon='mdi:refresh' width='20' height='20' />}
              className='flex-[1]'
              isDisabled={!selectedAppId || isRefreshing}
            >
              刷新
            </Button>
          </div>
          <ScrollShadow className='h-[calc(100vh-300px)] overflow-y-auto'>
            <ResourceList setIsRefreshing={setIsRefreshing} isRefreshing={isRefreshing} appId={selectedAppId} />
          </ScrollShadow>
        </Tab>
      </Tabs>

      <Modal isOpen={isDeleteConfirmOpen} onClose={onDeleteConfirmClose} size='xs'>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>
            <p>您确定要删除这个表单吗？此操作无法撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button size='sm' color='default' onClick={onDeleteConfirmClose}>
              取消
            </Button>
            <Button size='sm' color='danger' onClick={confirmDeleteForm} isLoading={deletingFormId !== null}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Button color='danger' onClick={handleLogout} className='mt-4 w-full'>
        退出登录
      </Button>
    </motion.div>
  )
}

export default FormsPage