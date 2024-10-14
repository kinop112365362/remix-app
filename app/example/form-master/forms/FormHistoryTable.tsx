import React, { useState, useEffect, useMemo } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"
import { deleteMetadata } from "../../service/apis/api"
import chatMoV2 from "../../service/chat/chat-deepseek"

interface FormHistoryTableProps {
  formId: string
}

const FormHistoryTable: React.FC<FormHistoryTableProps> = ({ formId }) => {
  const { getFormHistory } = useFormMetadata()
  const [history, setHistory] = useState<
    Array<{
      updatedAt: string
      value: string
      versionCode: number
      modifiedBy: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compareResult, setCompareResult] = useState<string>("")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const formHistory = await getFormHistory([`form_${formId}`])
        setHistory(formHistory)
      } catch (err) {
        console.error("获取历史记录失败:", err)
        setError("获取历史记录失败，请稍后重试。")
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [formId, getFormHistory])

  const handleDelete = async (name: string, versionCode: number) => {
    try {
      await deleteMetadata({ name, versionCode })
      // 重新获取历史记录以更新列表
      const updatedHistory = await getFormHistory([`form_${formId}`])
      setHistory(updatedHistory)
    } catch (error) {
      console.error("删除记录失败:", error)
      setError("删除记录失败，请稍后重试。")
    }
  }

  const compareVersions = async (currentVersion: any, previousVersion: any) => {
    setIsComparing(true)
    onOpen()
    try {
      const messages = [
        { role: "system", content: "你是一个专门用于比较两个版本差异的助手。请用简洁的语言总结主要变更。" },
        {
          role: "user",
          content: `请比较这两个版本并用一句话总结主要变更：\n\n新版本：${currentVersion}\n\n老版本：${previousVersion}`,
        },
      ]

      let result = ""
      await chatMoV2(
        messages,
        (chunk) => {
          result += chunk
          setCompareResult(result)
        },
        () => {},
        true,
        0.7
      )
    } catch (error) {
      console.error("比较版本失败:", error)
      setCompareResult("比较版本时发生错误，请稍后重试。")
    } finally {
      setIsComparing(false)
    }
  }

  if (isLoading) {
    return <Spinner label='加载中...' />
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>
  }

  return (
    <div className='mt-6'>
      <h3 className='text-lg font-semibold mb-2'>修改记录</h3>
      {history.length > 0 ? (
        <Table aria-label='修改记录'>
          <TableHeader>
            <TableColumn>时间</TableColumn>
            <TableColumn>版本</TableColumn>
            <TableColumn>修改详情</TableColumn>
            <TableColumn>修改人</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody>
            {history.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.updatedAt}</TableCell>
                <TableCell>{record.versionCode}</TableCell>
                <TableCell>
                  {index < history.length - 1 ? (
                    <Button
                      size='sm'
                      color='primary'
                      onPress={() => compareVersions(record.value, history[index + 1].value)}
                    >
                      查看详情
                    </Button>
                  ) : (
                    "初始版本"
                  )}
                </TableCell>
                <TableCell>{record.modifiedBy}</TableCell>
                <TableCell>
                  <Button size='sm' color='danger' onClick={() => handleDelete(`form_${formId}`, record.versionCode)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>暂无修改记录</div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>版本比较结果</ModalHeader>
              <ModalBody>{isComparing ? <Spinner label='正在比较版本...' /> : <p>{compareResult}</p>}</ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FormHistoryTable
