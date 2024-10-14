import React, { useState, useEffect } from "react"
import { Select, SelectItem } from "@nextui-org/react"
import { queryMyProject, queryMyProjectApps } from "../../service/apis/api"
import { getAppId } from "../../utils"

interface ProjectAppSelectorProps {
  onAppSelect: (appId: string) => void
}

const ProjectAppSelector: React.FC<ProjectAppSelectorProps> = ({ onAppSelect }) => {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [apps, setApps] = useState<any[]>([])
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
    const cachedProjectId = sessionStorage.getItem("x-project-id")
    const cachedAppId = getAppId()
    if (cachedProjectId) {
      setSelectedProject(cachedProjectId)
      fetchApps(cachedProjectId)
    }
    if (cachedAppId) {
      setSelectedApp(cachedAppId)
      onAppSelect(cachedAppId)
    }
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchApps(selectedProject)
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await queryMyProject({ limit: 100, offset: 0 })
      setProjects(response.data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const fetchApps = async (projectId: string) => {
    try {
      const response = await queryMyProjectApps({ projectId, limit: 100, offset: 0 })
      setApps(response.data)
    } catch (error) {
      console.error("Error fetching apps:", error)
    }
  }

  const handleProjectChange = (value: string) => {
    setSelectedProject(value)
    setSelectedApp(null)
    sessionStorage.setItem("x-project-id", value)
    sessionStorage.removeItem("x-app-id")
  }

  const handleAppChange = (value: string) => {
    setSelectedApp(value)
    onAppSelect(value)
    sessionStorage.setItem("x-app-id", value)
  }

  return (
    <div className='flex w-full flex-nowrap gap-1'>
      <Select
        label='选择项目'
        placeholder='请选择项目'
        selectedKeys={selectedProject ? [selectedProject] : []}
        onChange={(e) => handleProjectChange(e.target.value)}
      >
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </Select>
      <Select
        label='选择应用'
        placeholder='请选择应用'
        selectedKeys={selectedApp ? [selectedApp] : []}
        onChange={(e) => handleAppChange(e.target.value)}
        isDisabled={!selectedProject}
      >
        {apps.map((app) => (
          <SelectItem key={app.id} value={app.id}>
            {app.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}

export default ProjectAppSelector
