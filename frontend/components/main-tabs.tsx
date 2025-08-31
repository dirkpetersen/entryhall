"use client"

import * as Tabs from "@radix-ui/react-tabs"
import { User, Briefcase, Shield, FolderOpen, Terminal, Github } from "lucide-react"
import { UserAccountTab } from "./tabs/user-account-tab"
import { ResourcesTab } from "./tabs/resources-tab"
import { TerminalTab } from "./tabs/terminal-tab"
import { GitHubTab } from "./tabs/github-tab"

export function MainTabs() {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <Tabs.Root defaultValue="user" className="w-full">
        <Tabs.List className="flex w-full border-b bg-gray-50 rounded-t-lg">
          <Tabs.Trigger
            value="user"
            className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 font-medium transition-colors rounded-tl-lg"
          >
            <User className="w-4 h-4" />
            User Account
          </Tabs.Trigger>
          <Tabs.Trigger
            value="resources"
            className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 font-medium transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Resources
          </Tabs.Trigger>
          <Tabs.Trigger
            value="authorization"
            className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 font-medium transition-colors"
          >
            <Shield className="w-4 h-4" />
            Authorization
          </Tabs.Trigger>
          <Tabs.Trigger
            value="files"
            className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 font-medium transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Files
          </Tabs.Trigger>
          <Tabs.Trigger
            value="terminal"
            className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 font-medium transition-colors"
          >
            <Terminal className="w-4 h-4" />
            Terminal
          </Tabs.Trigger>
          <Tabs.Trigger
            value="github"
            className="flex items-center gap-2 px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-white data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 font-medium transition-colors rounded-tr-lg"
          >
            <Github className="w-4 h-4" />
            GitHub
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="user" className="p-6">
          <UserAccountTab />
        </Tabs.Content>

        <Tabs.Content value="resources" className="p-6">
          <ResourcesTab />
        </Tabs.Content>

        <Tabs.Content value="authorization" className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authorization Management</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">Group management and LDAP/Grouper integration will be implemented here.</p>
          </div>
        </Tabs.Content>

        <Tabs.Content value="files" className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">File Management</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">File upload/download features will be implemented here.</p>
          </div>
        </Tabs.Content>

        <Tabs.Content value="terminal" className="p-6">
          <TerminalTab />
        </Tabs.Content>

        <Tabs.Content value="github" className="p-6">
          <GitHubTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}