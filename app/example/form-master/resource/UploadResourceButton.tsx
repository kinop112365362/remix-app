import React, { useState } from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import * as XLSX from "xlsx"
import { setMetadata } from "../../service/apis/api"

interface UploadResourceButtonProps {
  appId: string | null
  isDisabled: boolean
}

const UploadResourceButton: React.FC<UploadResourceButtonProps> = ({ appId, isDisabled }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !appId) return

    setUploading(true)
    try {
      const data = await readExcel(file)
      await uploadData(data)
      onClose()
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setUploading(false)
      setFile(null)
    }
  }

  const readExcel = (file: File): Promise<{ id: string; name: string }[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as { id: string; name: string }[]
        resolve(jsonData)
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  const uploadData = async (data: { id: string; name: string }[]) => {
    if (!appId) return
    const resourceData = JSON.stringify(data)
    await setMetadata("resources", resourceData, appId)
  }

  return (
    <>
      <Button
        color="primary"
        onClick={onOpen}
        startContent={<Icon icon="mdi:upload" width="20" height="20" />}
        isDisabled={isDisabled}
      >
        上传资料
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>上传资料</ModalHeader>
          <ModalBody>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              取消
            </Button>
            <Button color="primary" onClick={handleUpload} isLoading={uploading} isDisabled={!file}>
              上传
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UploadResourceButton