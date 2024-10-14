import React, { useState, useRef, useEffect } from "react"
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import * as XLSX from "xlsx"
import { setMetadata, getMetadata } from "../../service/apis/api"

interface CreateResourceButtonProps {
  appId: string | null
  isDisabled: boolean
}

const CreateResourceButton: React.FC<CreateResourceButtonProps> = ({ appId, isDisabled }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [resourceName, setResourceName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("")
    }
  }, [isOpen])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      // 使用文件名（不包括扩展名）作为默认资料名
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.')
      setResourceName(fileName)
    }
  }

  const handleFilePreview = async (file: File) => {
    const data = await readExcel(file)
    setPreviewData(data.slice(0, 5)) // Preview first 5 rows
  }

  const readExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  const handleUpload = async () => {
    if (!file || !appId || !resourceName) {
      setErrorMessage("请填写所有必要信息并选择文件。")
      return
    }

    setUploading(true)
    setErrorMessage("")

    try {
      // 检查资源名称是否已存在
      const result = await getMetadata(["resources"], appId)
      let resourceIndexes = []
      if (result.data && result.data.length > 0 && result.data[0].value) {
        resourceIndexes = JSON.parse(result.data[0].value)
      }

      const isNameExists = resourceIndexes.some((resource: any) => resource.name === resourceName)
      if (isNameExists) {
        setErrorMessage("资源名称已存在，请使用其他名称。")
        setUploading(false)
        return
      }

      const data = await readExcel(file)
      await uploadData(data)
      await updateResourceIndex(resourceName)
      onClose()
    } catch (error) {
      console.error("Error uploading file:", error)
      setErrorMessage("上传文件时发生错误，请重试。")
    } finally {
      setUploading(false)
      setFile(null)
      setResourceName("")
      setPreviewData([])
    }
  }

  const uploadData = async (data: any[]) => {
    if (!appId) return
    const resourceData = JSON.stringify(data)
    await setMetadata(resourceName, resourceData, appId)
  }

  const updateResourceIndex = async (newResourceName: string) => {
    if (!appId) return
    try {
      const result = await getMetadata(["resources"], appId)
      let resourceIndexes = []
      if (result.data && result.data.length > 0 && result.data[0].value) {
        resourceIndexes = JSON.parse(result.data[0].value)
      }
      resourceIndexes.push({
        id: Date.now().toString(),
        name: newResourceName,
      })
      await setMetadata("resources", JSON.stringify(resourceIndexes), appId)
    } catch (error) {
      console.error("Error updating resource index:", error)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0]
      setFile(droppedFile)
      // 使用文件名（不包括扩展名）作为默认资料名
      const fileName = droppedFile.name.split('.').slice(0, -1).join('.')
      setResourceName(fileName)
    }
  }

  const handleDivClick = () => {
    fileInputRef.current?.click()
  }

  const handlePreviewClick = () => {
    if (file) {
      handleFilePreview(file)
      window.open(`/resources/preview?appId=${appId}`, "_blank")
    }
  }

  return (
    <>
      <Button
        color='primary'
        onClick={onOpen}
        startContent={<Icon icon='mdi:upload' width='20' height='20' />}
        isDisabled={isDisabled}
      >
        创建资料
      </Button>
      <Modal placement='top-center' isOpen={isOpen} onClose={onClose} size='2xl'>
        <ModalContent>
          <ModalHeader>创建资料</ModalHeader>
          <ModalBody>
            <Input
              label='资料名称'
              placeholder='请输入资料名称'
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              required
            />
            <div className='mt-4'>
              <div
                onClick={handleDivClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className='flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none'
              >
                {file ? (
                  <span className='flex items-center space-x-2'>
                    <Icon icon='mdi:file-excel' width='24' height='24' className='text-green-500' />
                    <span className='font-medium text-gray-600'>{file.name}</span>
                  </span>
                ) : (
                  <span className='flex items-center space-x-2'>
                    <Icon icon='mdi:upload' width='24' height='24' className='text-gray-600' />
                    <span className='font-medium text-gray-600'>点击选择或拖拽文件到这里</span>
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                id='file-upload'
                name='file-upload'
                type='file'
                accept='.xlsx,.xls,.csv'
                className='sr-only'
                onChange={handleFileChange}
              />
            </div>
            {errorMessage && <div className='mt-4 text-red-500'>{errorMessage}</div>}
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onClick={onClose}>
              取消
            </Button>
            <Button color='primary' onClick={handleUpload} isLoading={uploading} isDisabled={!file || !resourceName}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CreateResourceButton