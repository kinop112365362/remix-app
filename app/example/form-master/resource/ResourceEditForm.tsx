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
  Input,
  Button,
} from "@nextui-org/react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { getMetadata, setMetadata } from "../../service/apis/api"

const ResourceEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appId = searchParams.get("appId")
  const [resource, setResource] = useState<any>(null)
  const navigate = useNavigate()

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

  const handleInputChange = (rowIndex: number, columnName: string, value: string) => {
    setResource((prevResource: any) => {
      const newData = [...prevResource.data]
      newData[rowIndex] = { ...newData[rowIndex], [columnName]: value }
      return { ...prevResource, data: newData }
    })
  }

  const handleSave = async () => {
    try {
      await setMetadata(resource.name, JSON.stringify(resource.data), appId)
      navigate(`/resources/view/${id}?appId=${appId}`)
    } catch (error) {
      console.error("Error saving resource data:", error)
    }
  }

  if (!resource) {
    return <div>Loading...</div>
  }

  return (
    <Card className='w-full'>
      <CardBody>
        <h2 className='text-2xl font-bold mb-4'>{resource.name}</h2>
        <Table aria-label='Resource data'>
          <TableHeader>
            {Object.keys(resource.data[0]).map((key) => (
              <TableColumn key={key}>{key}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {resource.data.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {Object.entries(row).map(([key, value]: [string, any], cellIndex: number) => (
                  <TableCell key={cellIndex}>
                    <Input value={value} onChange={(e) => handleInputChange(rowIndex, key, e.target.value)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button color='primary' onClick={handleSave} className='mt-4'>
          保存修改
        </Button>
      </CardBody>
    </Card>
  )
}

export default ResourceEditForm
