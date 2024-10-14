import React, { useState, useEffect } from "react"
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react"
import { useSearchParams } from "react-router-dom"
import { getMetadata } from "../../service/apis/api"

const ResourcePreviewPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const appId = searchParams.get("appId")
  const [previewData, setPreviewData] = useState<any[]>([])

  useEffect(() => {
    if (appId) {
      fetchPreviewData()
    }
  }, [appId])

  const fetchPreviewData = async () => {
    try {
      const response = await getMetadata(["resourcePreview"], appId)
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const data = JSON.parse(response.data[0].value)
        setPreviewData(data.slice(0, 5)) // Preview first 5 rows
      }
    } catch (error) {
      console.error("Error fetching preview data:", error)
    }
  }

  if (previewData.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <Card className="w-full">
      <CardBody>
        <h2 className="text-2xl font-bold mb-4">资料预览</h2>
        <Table aria-label="Preview data">
          <TableHeader>
            {Object.keys(previewData[0]).map((key) => (
              <TableColumn key={key}>{key}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {previewData.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((value: any, cellIndex: number) => (
                  <TableCell key={cellIndex}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default ResourcePreviewPage