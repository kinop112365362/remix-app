import React, { useEffect, useState, useCallback, useRef, useTransition } from "react"
import { Button, Tooltip, Badge, Avatar, Link, Image, Accordion, AccordionItem, Chip, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useClipboard } from "@nextui-org/use-clipboard"
import { cn } from "../theme/cn"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useTranslation } from "react-i18next"
import mermaid from "mermaid"

type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: string
  showFeedback?: boolean
  message?: string
  currentAttempt?: number
  status?: "success" | "failed" | "streaming" | "loading" | "cancelled"
  attempts?: number
  messageClassName?: string
  onAttemptChange?: (attempt: number) => void
  onMessageCopy?: (content: string) => void
  onFeedback?: (feedback: "like" | "dislike") => void
  onAttemptFeedback?: (feedback: "like" | "dislike" | "same") => void
  images?: string[]
  role?: "user" | "assistant"
  onDeleteMessage?: () => void
  messageType?: "normal" | "guidance" | "system"
  onSwitchAgent?: (agentId: string) => void
  isGuidance?: boolean
  onDeleteGuidanceMessage?: () => void
}

const Tip = ({ children, color = "danger" }) => {
  return <Chip color={color}>{children}</Chip>
}

const MoUIToolUse = ({ tip, input }) => {
  console.log(input)
  return <Chip>{tip}</Chip>
}

const MoUIImage = ({ type }) => {
  const urls = {
    domain: domain,
    git: git,
    gitAddress: gitAddress,
    code: code,
    file,
  }
  return <Image src={urls[type]}></Image>
}

const MoUIButton = ({ children, module, method, payload, icon = "mdi:cursor-default-click", ...props }) => (
  <Button
    color='secondary'
    startContent={icon && <Icon icon={icon} />}
    onPress={() => {
      inject(module)[method](payload)
    }}
    {...props}
  >
    {children}
  </Button>
)

const MoUIHidden = ({ children }) => <div className='hidden'>{children}</div>

// 新增的 Mermaid 组件
const Mermaid = ({ chart }) => {
  const [svg, setSvg] = useState("")
  const mermaidRef = useRef()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    })

    mermaid.render("mermaid", chart).then((result) => {
      setSvg(result.svg)
    })
  }, [chart])

  return <div ref={mermaidRef} dangerouslySetInnerHTML={{ __html: svg }} />
}

const MessageCard = React.memo(
  React.forwardRef<HTMLDivElement, MessageCardProps>(
    (
      {
        avatar,
        message,
        showFeedback,
        attempts = 1,
        currentAttempt = 1,
        status,
        onMessageCopy,
        onAttemptChange,
        onFeedback,
        onAttemptFeedback,
        className,
        messageClassName,
        images,
        role,
        onDeleteMessage,
        messageType = "normal",
        onSwitchAgent,
        isGuidance = false,
        onDeleteGuidanceMessage,
        ...props
      },
      ref
    ) => {
      const { t } = useTranslation()
      const [feedback, setFeedback] = useState<"like" | "dislike">()
      const [attemptFeedback, setAttemptFeedback] = useState<"like" | "dislike" | "same">()
      const [displayedMessage, setDisplayedMessage] = useState(message)
      const [isLoading, setIsLoading] = useState(role === "user" ? false : true)
      const [isPending, startTransition] = useTransition()

      const messageRef = useRef<HTMLDivElement>(null)

      const { copied, copy } = useClipboard()

      useEffect(() => {
        setDisplayedMessage(message)
      }, [message?.length])

      const failedMessageClassName =
        status === "failed" ? "bg-danger-100/50 border border-danger-100 text-foreground" : ""
      const failedMessage = (
        <p>
          {t("chat_error_message")}
          <Link href='mailto:info@mobenai.com.cn' size='sm'>
            info@mobenai.com.cn
          </Link>
        </p>
      )

      const hasFailed = status === "failed"

      useEffect(() => {
        const cancel = () => {
          console.log("cancel")
          setIsLoading(false)
        }
        const commander = create({
          name: "MessageCard",
          exports: {
            cancel,
          },
        })
        return () => {
          commander.dispose()
        }
      }, [])

      useEffect(() => {
        if (status === "loading") {
          setIsLoading(true)
        }
        if (status === "streaming") {
          setIsLoading(false)
        }
        if (status === "failed" || status === "cancelled") {
          setIsLoading(false)
        }
      }, [status])

      const handleCopy = useCallback(() => {
        startTransition(() => {
          const valueToCopy = displayedMessage || messageRef.current?.textContent || ""
          copy(valueToCopy)
          onMessageCopy?.(valueToCopy)
        })
      }, [copy, displayedMessage, onMessageCopy])

      const handleAttemptFeedback = useCallback(
        (feedback: "like" | "dislike" | "same") => {
          setAttemptFeedback(feedback)
          onAttemptFeedback?.(feedback)
        },
        [onAttemptFeedback]
      )

      const renderUsageInfo = (usage) => {
        if (!usage) return null
        return (
          <div className='mt-2 flex flex-wrap gap-2'>
            <Chip size='sm' variant='flat' color='primary'>
              Prompt Tokens: {usage.prompt_tokens}
            </Chip>
            <Chip size='sm' variant='flat' color='secondary'>
              Completion Tokens: {usage.completion_tokens}
            </Chip>
            <Chip size='sm' variant='flat' color='success'>
              Total Tokens: {usage.total_tokens}
            </Chip>
            {usage.prompt_cache_hit_tokens !== undefined && (
              <Chip size='sm' variant='flat' color='warning'>
                Cache Hit Tokens: {usage.prompt_cache_hit_tokens}
              </Chip>
            )}
            {usage.prompt_cache_miss_tokens !== undefined && (
              <Chip size='sm' variant='flat' color='danger'>
                Cache Miss Tokens: {usage.prompt_cache_miss_tokens}
              </Chip>
            )}
          </div>
        )
      }

      const renderContent = () => {
        console.log(status)
        if (status === "cancelled") {
          return (
            <div>
              {/* <p>{t("message_cancelled")}</p> */}
              <p>......</p>
            </div>
          )
        }
        if (hasFailed) {
          return failedMessage
        }
        if (isLoading && !displayedMessage) {
          return (
            <div className='flex items-center'>
              <Spinner size='sm' className='mr-2' />
              {t("thinking")}
            </div>
          )
        }

        let contentClassName = "markdown-body markdown-body-guidance"
        if (messageType === "guidance") {
          contentClassName += " text-black p-0 rounded-lg"
        }

        let usage = null
        try {
          if (displayedMessage?.includes("usage")) {
            usage = messageObj.usage
          }
        } catch (error) {
          // 如果解析失败，说明消息不是JSON格式，继续使用原始消息
        }

        const markdownContent = (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            // rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "")
                if (match && match[1] == "mo") {
                  if (children && children.startsWith("<final_plan")) {
                    if (children.includes("</final_plan>")) {
                      return <div className='p-2 bg-slate-700 overflow-auto text-white'>{children}</div>
                    } else {
                      return <Tip>根据思考🤔进行计划...</Tip>
                    }
                  }
                  if (children && children.startsWith("<think")) {
                    if (children.includes("</think>")) {
                      return <Tip color='success'>思考完成 ✔️</Tip>
                    } else {
                      return <Tip>让我思考一下...</Tip>
                    }
                  }
                  // if (children && children.startsWith("<mo-ai-file")) {
                  //   if (children.includes("</mo-ai-file>")) {
                  //     return <Tip color="waring">代码编写完成 ✔️</Tip>
                  //   } else {
                  //     return <Tip>正在编写代码，请稍后...</Tip>
                  //   }
                  // }
                  if (children && children.startsWith("<mo-ai-workflow")) {
                    if (children.includes("</mo-ai-workflow>")) {
                      return <Tip color='success'>工作流程创建完成 ✔️</Tip>
                    } else {
                      return <Tip>正在创建工作流程，请稍后...</Tip>
                    }
                  }
                  if (children && children.startsWith("<mo-ai-bash")) {
                    if (children.includes("</mo-ai-bash>")) {
                      return <Tip color='success'>Shell 命令创建完成 ✔️</Tip>
                    } else {
                      return <Tip>正在创建 Shell 命令，请稍后...</Tip>
                    }
                  }
                  return (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  )
                } else if (match && match[1] === "mermaid") {
                  return (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  )
                } else {
                  return (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  )
                }
              },
              // "mo-ui-button": (props) => <MoUIButton {...props} />,
              // "mo-ui-hidden": (props) => <MoUIHidden {...props} />,
              // "mo-ui-setup-guide": (props) => <SetupGuide {...props} />,
              // "mo-ui-image": (props) => <MoUIImage {...props} />,
              // "mo-ui-ai-engineer-guide": (props) => <MoUIAIEngineerGuide {...props} />,
              // "mo-ui-tool-use": (props) => <MoUIToolUse {...props} />,
            }}
          >
            {usage ? JSON.stringify(usage) : displayedMessage || ""}
          </ReactMarkdown>
        )

        if (messageType === "guidance") {
          return (
            <Accordion isCompact variant='bordered' defaultExpandedKeys={["1"]}>
              <AccordionItem subtitle={t("guidance_message")} key='1' aria-label='引导语'>
                <div className={contentClassName}>
                  {markdownContent}
                  <Button size='sm' variant='light' onPress={onDeleteGuidanceMessage} className='mt-2 text-black'>
                    <Icon icon='mdi:close' className='mr-1' />
                    {t("delete_guidance")}
                  </Button>
                </div>
              </AccordionItem>
            </Accordion>
          )
        }

        return (
          <div className={contentClassName}>
            {markdownContent}
            {usage && renderUsageInfo(usage)}
          </div>
        )
      }

      return (
        <div {...props} ref={ref} className={cn("flex gap-3", className)}>
          <div className='relative flex-none'>
            <Badge
              isOneChar
              color='danger'
              content={<Icon className='text-background' icon='gravity-ui:circle-exclamation-fill' />}
              isInvisible={!hasFailed}
              placement='bottom-right'
              shape='circle'
            >
              <Avatar src={avatar} />
            </Badge>
          </div>
          <div className='flex w-full flex-col gap-4'>
            <div
              className={cn(
                "relative rounded-medium bg-content2 px-4 py-3 pr-20 text-default-600",
                failedMessageClassName,
                messageClassName,
                "sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl",
                "w-full"
              )}
            >
              {images && images.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-2'>
                  {images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={t("uploaded_image_cover")}
                      className='max-w-[100px] max-h-[100px] object-cover rounded'
                    />
                  ))}
                </div>
              )}
              <div ref={messageRef} className={`text-small markdown-body ${messageType !== "guidance" && ""}`}>
                {renderContent()}
              </div>
              {!hasFailed && !isLoading && (
                <div className='absolute right-2 bottom-2 flex rounded-full bg-content2 shadow-small'>
                  <Button isIconOnly radius='full' size='sm' variant='light' onPress={handleCopy}>
                    {copied ? (
                      <Icon className='text-lg text-default-600' icon='gravity-ui:check' />
                    ) : (
                      <Icon className='text-lg text-default-600' icon='gravity-ui:copy' />
                    )}
                  </Button>
                  <Button isIconOnly radius='full' size='sm' variant='light' onPress={onDeleteMessage}>
                    <Icon className='text-lg text-default-600' icon='mdi:delete' />
                  </Button>
                </div>
              )}
              {attempts > 1 && !hasFailed && !isLoading && (
                <div className='flex w-full items-center justify-end'>
                  <button onClick={() => onAttemptChange?.(currentAttempt > 1 ? currentAttempt - 1 : 1)}>
                    <Icon
                      className='cursor-pointer text-default-400 hover:text-default-500'
                      icon='gravity-ui:circle-arrow-left'
                    />
                  </button>
                  <button onClick={() => onAttemptChange?.(currentAttempt < attempts ? currentAttempt + 1 : attempts)}>
                    <Icon
                      className='cursor-pointer text-default-400 hover:text-default-500'
                      icon='gravity-ui:circle-arrow-right'
                    />
                  </button>
                  <p className='px-1 text-tiny font-medium text-default-500'>
                    {currentAttempt}/{attempts}
                  </p>
                </div>
              )}
            </div>
            {showFeedback && attempts > 1 && !isLoading && (
              <div className='flex items-center justify-between rounded-medium border-small border-default-100 px-4 py-3 shadow-small'>
                <p className='text-small text-default-600'>{t("is_this_answer_better_or_worse")}</p>
                <div className='flex gap-1'>
                  <Tooltip content={t("better")}>
                    <Button
                      isIconOnly
                      radius='full'
                      size='sm'
                      variant='light'
                      onPress={() => handleAttemptFeedback("like")}
                    >
                      {attemptFeedback === "like" ? (
                        <Icon className='text-lg text-primary' icon='gravity-ui:thumbs-up-fill' />
                      ) : (
                        <Icon className='text-lg text-default-600' icon='gravity-ui:thumbs-up' />
                      )}
                    </Button>
                  </Tooltip>
                  <Tooltip content={t("worse")}>
                    <Button
                      isIconOnly
                      radius='full'
                      size='sm'
                      variant='light'
                      onPress={() => handleAttemptFeedback("dislike")}
                    >
                      {attemptFeedback === "dislike" ? (
                        <Icon className='text-lg text-default-600' icon='gravity-ui:thumbs-down-fill' />
                      ) : (
                        <Icon className='text-lg text-default-600' icon='gravity-ui:thumbs-down' />
                      )}
                    </Button>
                  </Tooltip>
                  <Tooltip content={t("same")}>
                    <Button
                      isIconOnly
                      radius='full'
                      size='sm'
                      variant='light'
                      onPress={() => handleAttemptFeedback("same")}
                    >
                      {attemptFeedback === "same" ? (
                        <Icon className='text-lg text-danger' icon='gravity-ui:face-sad' />
                      ) : (
                        <Icon className='text-lg text-default-600' icon='gravity-ui:face-sad' />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
  )
)

MessageCard.displayName = "MessageCard"

export default MessageCard
