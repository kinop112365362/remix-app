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
import { useParams, useSearchParams } from "react-router-dom"
import { getMetadata } from "../../service/apis/api"

const ResourceViewForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appId = searchParams.get("appId")
  const [resource, setResource] = useState<any>(null)

  useEffect(() => {
    if (id && appId) {
      fetchResourceData()
    }
  }, [id, appId])

  const fetchResourceData = async () => {
    try {
      const response = await getMetadata(["resources"], appId)
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const resourcesData = JSON.parse(response.data[0].value)
        const currentResource = resourcesData.find((r: any) => r.id === id)
        if (currentResource) {
          const resourceDataResponse = await getMetadata([currentResource.name], appId)
          if (resourceDataResponse.data && resourceDataResponse.data.length > 0 && resourceDataResponse.data[0].value) {
            setResource({
              ...currentResource,
              data: JSON.parse(resourceDataResponse.data[0].value),
            })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching resource data:", error)
    }
  }

  if (!resource) {
    return <div>Loading...</div>
  }

  return (
    <Card className="w-full">
      <CardBody>
        <h2 className="text-2xl font-bold mb-4">{resource.name}</h2>
        <Table aria-label="Resource data">
          <TableHeader>
            {Object.keys(resource.data[0]).map((key) => (
              <TableColumn key={key}>{key}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {resource.data.map((row: any, index: number) => (
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

export default ResourceViewForm