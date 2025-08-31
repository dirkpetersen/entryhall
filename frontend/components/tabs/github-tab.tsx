"use client"

import { useState, useEffect, useCallback } from "react"
// import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, GitBranch, GitPullRequest, Search, ExternalLink } from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  private: boolean
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  language: string
}

interface LinkedAccount {
  accountType: string
  email?: string
  externalId: string
}

export function GitHubTab() {
  // const { data: session } = useSession()
  const session = null
  const [isGitHubLinked, setIsGitHubLinked] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [userRepos, setUserRepos] = useState<Repository[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const fetchUserRepos = useCallback(async () => {
    try {
      const response = await fetch("/api/github/repos")
      if (response.ok) {
        const repos = await response.json()
        setUserRepos(repos)
      }
    } catch (error) {
      console.error("Failed to fetch repos:", error)
    }
  }, [])

  const checkGitHubLink = useCallback(async () => {
    try {
      const response = await fetch("/api/user/linked-accounts")
      if (response.ok) {
        const accounts = await response.json()
        const githubAccount = accounts.find((acc: LinkedAccount) => acc.accountType === "github")
        setIsGitHubLinked(!!githubAccount)
        
        if (githubAccount) {
          fetchUserRepos()
        }
      }
    } catch (error) {
      console.error("Failed to check GitHub link:", error)
    }
  }, [fetchUserRepos])

  useEffect(() => {
    checkGitHubLink()
  }, [checkGitHubLink])

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo)
    setRepoUrl(repo.html_url)
  }

  const handleUrlSubmit = async () => {
    if (!repoUrl) return

    try {
      const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (urlParts) {
        const [, owner, repo] = urlParts
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
        if (response.ok) {
          const repoData = await response.json()
          setSelectedRepo(repoData)
        }
      }
    } catch (error) {
      console.error("Failed to fetch repository:", error)
    }
  }

  const filteredRepos = userRepos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isGitHubLinked) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Access</CardTitle>
            <CardDescription>
              Link your GitHub account to access repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Github className="w-16 h-16 text-gray-400" />
              <p className="text-center text-gray-600">
                You haven&apos;t linked your GitHub account yet.
              </p>
              <p className="text-center text-sm text-gray-500">
                Please go to the User Account tab to link your GitHub account.
              </p>
              <Button
                onClick={() => {
                  const tabTrigger = document.querySelector('[value="user"]') as HTMLElement
                  tabTrigger?.click()
                }}
              >
                Go to User Account Tab
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Selection</CardTitle>
          <CardDescription>
            Select a repository from your account or enter a GitHub URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <div className="flex gap-2">
              <Input
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
              />
              <Button onClick={handleUrlSubmit}>
                <Search className="w-4 h-4 mr-2" />
                Load
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="mb-4">
              <Label htmlFor="search">Search Your Repositories</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repositories..."
                className="mt-1"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                    selectedRepo?.id === repo.id ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => handleRepoSelect(repo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repo.name}</span>
                        {repo.private && (
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                            Private
                          </span>
                        )}
                        {repo.fork && (
                          <GitBranch className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {repo.language && <span>{repo.language}</span>}
                        <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedRepo && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Repository</CardTitle>
            <CardDescription>
              {selectedRepo.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-gray-600">
                  {selectedRepo.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Language</p>
                  <p className="text-sm text-gray-600">{selectedRepo.language || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Visibility</p>
                  <p className="text-sm text-gray-600">
                    {selectedRepo.private ? "Private" : "Public"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRepo.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRepo.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <a
                  href={selectedRepo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                </a>
                <Button variant="outline">
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Clone Repository
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}