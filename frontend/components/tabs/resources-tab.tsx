"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, FileText } from "lucide-react"

interface Project {
  id: number
  woerkId: string
  shortName: string
  description?: string
  isGrantProject: boolean
  createdAt: string
}

interface Allocation {
  id: number
  resourceType: string
  quantity: number
  allocationModel: string
  periodStart: string
  periodEnd: string
}

export function ResourcesTab() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [allocations] = useState<Allocation[]>([])
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProject, setNewProject] = useState({
    shortName: "",
    description: "",
    isGrantProject: false,
    grantId: "",
  })
  const [grantSearchQuery, setGrantSearchQuery] = useState("")
  const [grantSearchResults, setGrantSearchResults] = useState([])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const createProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      })
      if (response.ok) {
        const project = await response.json()
        setProjects([...projects, project])
        setShowNewProjectForm(false)
        setNewProject({
          shortName: "",
          description: "",
          isGrantProject: false,
          grantId: "",
        })
      }
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  const searchGrants = async () => {
    try {
      const response = await fetch(
        `https://www.grants.gov/api/common/search2?query=${encodeURIComponent(grantSearchQuery)}`
      )
      if (response.ok) {
        const data = await response.json()
        setGrantSearchResults(data.results || [])
      }
    } catch (error) {
      console.error("Failed to search grants:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Projects / Woerks</CardTitle>
              <CardDescription>
                Manage your projects and resource allocations
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewProjectForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showNewProjectForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shortName">Short Name (Max 30 chars)</Label>
                  <Input
                    id="shortName"
                    value={newProject.shortName}
                    onChange={(e) =>
                      setNewProject({ ...newProject, shortName: e.target.value })
                    }
                    maxLength={30}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Max 1024 chars)</Label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    maxLength={1024}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGrantProject"
                    checked={newProject.isGrantProject}
                    onChange={(e) =>
                      setNewProject({ ...newProject, isGrantProject: e.target.checked })
                    }
                  />
                  <Label htmlFor="isGrantProject">U.S. Federal Grant Project</Label>
                </div>

                {newProject.isGrantProject && (
                  <div className="space-y-4 p-4 border rounded-md">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search grants.gov..."
                        value={grantSearchQuery}
                        onChange={(e) => setGrantSearchQuery(e.target.value)}
                      />
                      <Button onClick={searchGrants}>
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>

                    {grantSearchResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto border rounded">
                        {grantSearchResults.map((grant: { id: string; title: string }, idx) => (
                          <div
                            key={idx}
                            className="p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setNewProject({ ...newProject, grantId: grant.id })
                            }}
                          >
                            {grant.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={createProject}>Create Project</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewProjectForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={`cursor-pointer ${
                  selectedProject?.id === project.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold">
                          {project.woerkId}
                        </span>
                        <span className="text-lg">{project.shortName}</span>
                        {project.isGrantProject && (
                          <FileText className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Allocations for {selectedProject.shortName}</CardTitle>
            <CardDescription>
              Manage resource allocations for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Allocation
              </Button>

              {allocations.length === 0 ? (
                <p className="text-gray-500">No allocations yet</p>
              ) : (
                <div className="space-y-2">
                  {allocations.map((allocation) => (
                    <Card key={allocation.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">
                              {allocation.resourceType}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">
                              {allocation.quantity} units
                            </span>
                          </div>
                          <span className="text-sm">
                            {allocation.allocationModel}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}