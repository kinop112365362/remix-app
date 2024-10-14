import React, { useEffect, useState } from "react"
import { useReportsMetadata } from "../report-templates/hook/useReportsMetadata"
import { reportTemplatesMap } from "../report-templates/reportTemplateConfig"
import { Spinner } from "@nextui-org/react"
import { useParams, useLocation } from "react-router-dom"

interface ReadReportRendererProps {
  reportId?: string
}

const ReadReportRenderer: React.FC<ReadReportRendererProps> = ({ reportId: propReportId }) => {
  const { getReportById } = useReportsMetadata()
  const [currentReport, setCurrentReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id: paramReportId } = useParams<{ id: string }>()
  const location = useLocation()
  const [appId, setAppId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const appIdParam = params.get("appId")
    if (appIdParam) {
      setAppId(appIdParam)
    }
  }, [location])

  useEffect(() => {
    const reportIdToUse = propReportId || paramReportId
    if (reportIdToUse && appId) {
      loadReport(reportIdToUse)
    }
  }, [propReportId, paramReportId, appId])

  const loadReport = async (reportId: string) => {
    try {
      setLoading(true)
      const reportDetails = await getReportById(reportId)
      if (reportDetails) {
        setCurrentReport(reportDetails)
      } else {
        setError("Report not found")
      }
    } catch (err) {
      console.error("Error loading report:", err)
      setError("An error occurred while loading the report")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='w-screen h-screen flex justify-center items-center'>
        <Spinner label='Loading...'></Spinner>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!currentReport) {
    return <div>Report not found</div>
  }

  const ReportComponent = reportTemplatesMap[currentReport.templateId]
  if (!ReportComponent) {
    console.error("[ReadReportRenderer] Template not found for id:", currentReport.templateId)
    return <div>Invalid report template</div>
  }

  return (
    <div className='p-4 min-h-screen'>
      <div className='rounded-lg p-4 bg-white'>
        <ReportComponent reportId={currentReport.id} data={currentReport.data} />
      </div>
    </div>
  )
}

export default ReadReportRenderer
