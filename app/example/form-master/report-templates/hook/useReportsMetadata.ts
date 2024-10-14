import { useState, useCallback } from "react"
import { setMetadata, getMetadata, queryMetadataHistory } from "../../../service/apis/api"
import { getCurrentAccountInfo } from "../../../service/apis/user"
import { jsonParse, jsonStringify } from "../../../utils"

interface ReportIndex {
  id: string
  templateId: string
  status: string
  title: string
}

interface ReportData {
  id: string
  templateId: string
  title: string
  data: any
  status: string
  versionCode: number
  modifiedBy: string
}

export const useReportsMetadata = () => {
  const [reports, setReports] = useState<ReportData[]>([])

  const fetchReports = useCallback(async () => {
    try {
      const result = await getMetadata(["reports"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        const reportIndexes: ReportIndex[] = jsonParse(result.data[0].value)

        const reportDetailsPromises = reportIndexes.map(async (reportIndex) => {
          const reportDetailResult = await getMetadata([`report_${reportIndex.id}`])
          if (reportDetailResult.data && reportDetailResult.data.length > 0 && reportDetailResult.data[0].value) {
            const reportData: ReportData = jsonParse(reportDetailResult.data[0].value)
            return {
              ...reportData,
              status: reportIndex.status,
              title: reportIndex.title,
              versionCode: reportDetailResult.data[0].versionCode,
            }
          }
          return null
        })

        const reportDetails = await Promise.all(reportDetailsPromises)
        const validReportDetails = reportDetails.filter((report): report is ReportData => report !== null)
        setReports(validReportDetails)
        return validReportDetails
      } else {
        setReports([])
        return []
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      setReports([])
      return []
    }
  }, [])

  const addReport = useCallback(async (newReport: ReportData) => {
    try {
      await setMetadata(`report_${newReport.id}`, jsonStringify(newReport))
      const result = await getMetadata(["reports"])
      let reportIndexes: ReportIndex[] = []
      if (result.data && result.data.length > 0 && result.data[0].value) {
        reportIndexes = jsonParse(result.data[0].value)
      }
      reportIndexes.push(newReport)
      await setMetadata("reports", jsonStringify(reportIndexes))
      setReports((prevReports) => [...prevReports, newReport])
      return true
    } catch (error) {
      console.error("Error adding report:", error)
      return false
    }
  }, [])

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      await setMetadata(`report_${reportId}`, "") // Delete the individual report data
      const result = await getMetadata(["reports"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        let reportIndexes: ReportIndex[] = jsonParse(result.data[0].value)
        reportIndexes = reportIndexes.filter((report) => report.id !== reportId)
        await setMetadata("reports", jsonStringify(reportIndexes))
      }
      setReports((prevReports) => prevReports.filter((report) => report.id !== reportId))
      return true
    } catch (error) {
      console.error("Error deleting report:", error)
      return false
    }
  }, [])

  const getReportById = useCallback(async (reportId: string) => {
    try {
      const reportDetailResult = await getMetadata([`report_${reportId}`])
      if (reportDetailResult.data && reportDetailResult.data.length > 0 && reportDetailResult.data[0].value) {
        const reportData: ReportData = jsonParse(reportDetailResult.data[0].value)
        return { ...reportData, versionCode: reportDetailResult.data[0].versionCode }
      }
      return null
    } catch (error) {
      console.error("Error getting report by id:", error)
      return null
    }
  }, [])

  const updateReport = useCallback(async (updatedReport: ReportData) => {
    try {
      const currentUser = await getCurrentAccountInfo()
      const reportWithModifier = {
        ...updatedReport,
        modifiedBy: currentUser.name || currentUser.email || "Unknown User",
      }
      await setMetadata(`report_${updatedReport.id}`, jsonStringify(reportWithModifier))
      const result = await getMetadata(["reports"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        let reportIndexes: ReportIndex[] = jsonParse(result.data[0].value)
        const index = reportIndexes.findIndex((report) => report.id === updatedReport.id)
        if (index !== -1) {
          reportIndexes[index] = {
            id: updatedReport.id,
            templateId: updatedReport.templateId,
            status: updatedReport.status,
            title: updatedReport.title,
          }
          await setMetadata("reports", jsonStringify(reportIndexes))
        } else {
          reportIndexes.push({
            id: updatedReport.id,
            templateId: updatedReport.templateId,
            status: updatedReport.status,
            title: updatedReport.title,
          })
          await setMetadata("reports", jsonStringify(reportIndexes))
        }
      }
      setReports((prevReports) =>
        prevReports.map((report) => (report.id === updatedReport.id ? reportWithModifier : report))
      )
      return true
    } catch (error) {
      console.error("Error updating report:", error)
      return false
    }
  }, [])

  const updateReportStatus = useCallback(
    async (reportId: string, newStatus: string) => {
      try {
        const report = await getReportById(reportId)
        if (report) {
          const updatedReport = { ...report, status: newStatus }
          await updateReport(updatedReport)
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating report status:", error)
        return false
      }
    },
    [getReportById, updateReport]
  )

  const getReportHistory = useCallback(async (names: any) => {
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
      console.error("Error fetching report history:", error)
      return []
    }
  }, [])

  return {
    reports,
    fetchReports,
    addReport,
    deleteReport,
    getReportById,
    updateReport,
    updateReportStatus,
    getReportHistory,
  }
}
