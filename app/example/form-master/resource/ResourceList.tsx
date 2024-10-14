import React, { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, Button, useDisclosure } from "@nextui-org/react"
import { getMetadata, setMetadata, deleteMetadata } from "../../service/apis/api"
import { Icon } from "@iconify/react"

interface ResourceListProps {
  appId: string | null
  isRefreshing: boolean
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>
}

const ResourceList: React.FC<ResourceListProps> = ({ isRefreshing, appId, setIsRefreshing }) => {
  const [resources, setResources] = useState<{ id: string; name: string }[]>([])
  const [selectedResource, setSelectedResource] = useState<any>(null)

  const fetchResources = useCallback(async () => {
    if (!appId) return
    try {
      const response = await getMetadata(["resources"], appId)
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const resourceData = JSON.parse(response.data[0].value)
        setResources(resourceData)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
    }
  }, [appId])

  useEffect(() => {
    fetchResources()
    setIsRefreshing(false)
  }, [appId, isRefreshing])

  const handleViewResource = async (resource: { id: string; name: string }) => {
    if (!appId) return
    try {
      const response = await getMetadata([resource.name], appId)
      if (response.data && response.data.length > 0 && response.data[0].value) {
        setSelectedResource({
          ...resource,
          data: JSON.parse(response.data[0].value),
        })
        window.open(`/resources/view/${resource.id}?appId=${appId}`, "_blank")
      }
    } catch (error) {
      console.error("Error fetching resource data:", error)
    }
  }

  const handleEditResource = async (resource: { id: string; name: string }) => {
    if (!appId) return
    window.open(`/resources/edit/${resource.id}?appId=${appId}`, "_blank")
  }

  const handleDeleteResource = async (resource: { id: string; name: string }) => {
    if (!appId) return
    try {
      await deleteMetadata({ name: resource.name, versionCode: 0 })
      const updatedResources = resources.filter((r) => r.id !== resource.id)
      await setMetadata("resources", JSON.stringify(updatedResources), appId)
      setResources(updatedResources)
    } catch (error) {
      console.error("Error deleting resource:", error)
    }
  }

  return (
    <div className='space-y-4'>
      {resources.map((resource) => (
        <Card key={resource.id} className='w-full'>
          <CardHeader className='flex justify-between items-center'>
            <h4 className='text-lg font-semibold'>{resource.name}</h4>
            <div className='flex space-x-2'>
              <Button size='sm' color='primary' variant='light' onClick={() => handleViewResource(resource)}>
                <Icon icon='mdi:eye' width='18' height='18' />
              </Button>
              <Button size='sm' color='warning' variant='light' onClick={() => handleEditResource(resource)}>
                <Icon icon='mdi:pencil' width='18' height='18' />
              </Button>
              <Button size='sm' color='danger' variant='light' onClick={() => handleDeleteResource(resource)}>
                <Icon icon='mdi:delete' width='18' height='18' />
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export default ResourceList
