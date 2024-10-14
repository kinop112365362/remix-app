import React, { useCallback } from "react"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Trash2, Loader, Copy } from "lucide-react"
import { Spinner } from "@nextui-org/react"

type MessageType = "success" | "error" | "warning" | "info" | "delete" | "loading"

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  delete: Trash2,
  loading: Loader,
}

const colors = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
  delete: "text-gray-500",
  loading: "text-blue-500",
}

interface MessageWithCopyProps {
  content: string
  type: MessageType
}

const MessageWithCopy: React.FC<MessageWithCopyProps> = ({ content, type }) => {
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success("Copied to clipboard")
    }).catch((err) => {
      console.error("Failed to copy: ", err)
      toast.error("Failed to copy")
    })
  }, [content])

  return (
    <div className="flex items-center justify-between">
      <div className={`flex items-center ${type === 'loading' ? '' : colors[type]}`}>
        {type === "loading" ? (
          <Spinner size="sm" color="current" />
        ) : (
          React.createElement(icons[type], { size: 18 })
        )}
        <span className={`ml-2 ${type === 'loading' ? 'text-black' : ''}`}>{content}</span>
      </div>
      <button onClick={copyToClipboard} className="ml-2 p-1 rounded hover:bg-gray-200">
        <Copy size={16} />
      </button>
    </div>
  )
}

const showMessage = (type: MessageType, content: string, duration = 20000): string => {
  const id = Math.random().toString(36).substr(2, 9)

  const messageContent = <MessageWithCopy content={content} type={type} />

  toast[type === "delete" ? "error" : type](messageContent, {
    duration: type === "loading" ? null : duration,
    id,
  })

  return id
}

export const message = {
  success: (content: string, duration?: number) => showMessage("success", content, duration),
  error: (content: string, duration?: number) => showMessage("error", content, duration),
  warning: (content: string, duration?: number) => showMessage("warning", content, duration),
  info: (content: string, duration?: number) => showMessage("info", content, duration),
  delete: (content: string, duration?: number) => showMessage("delete", content, duration),
  loading: (content: string) => showMessage("loading", content),
  dismiss: (toastId: string) => toast.dismiss(toastId),
  update: (toastId: string, content: string) => {
    toast.custom(
      (t) => <MessageWithCopy content={content} type="loading" />,
      { id: toastId }
    )
  },
  closeLoading: (toastId: string, status?: "success" | "error", content?: string) => {
    toast.dismiss(toastId)
    if (status && content) {
      showMessage(status, content)
    }
  },
}