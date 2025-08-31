"use client"

import { useState } from "react"
// import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Link2, Github, Linkedin } from "lucide-react"

interface LinkedAccount {
  accountType: string
  email?: string
  externalId: string
}

export function UserAccountTab() {
  // const { data: session } = useSession()
  const session = { user: { email: 'test@example.com' } }
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    title: "",
    position: "",
    role: "",
    university: "",
    department: "",
    defaultIndex: "",
    defaultActivityCode: "",
  })
  const [linkedAccounts] = useState<LinkedAccount[]>([])

  const handleSave = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      })
      if (response.ok) {
        alert("Profile updated successfully")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const linkAccount = async (provider: string) => {
    window.location.href = `/api/auth/link/${provider}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Registration & Authentication</CardTitle>
          <CardDescription>
            Manage your account information and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{session?.user?.email || "Not logged in"}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={userInfo.fullName}
                onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="title">Title/Position</Label>
              <Input
                id="title"
                value={userInfo.title}
                onChange={(e) => setUserInfo({ ...userInfo, title: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full px-3 py-2 border rounded-md"
                value={userInfo.role}
                onChange={(e) => setUserInfo({ ...userInfo, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="staff">Staff</option>
                <option value="professional_faculty">Professional Faculty</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={userInfo.university}
                onChange={(e) => setUserInfo({ ...userInfo, university: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={userInfo.department}
                onChange={(e) => setUserInfo({ ...userInfo, department: e.target.value })}
              />
            </div>
          </div>
          
          <Button onClick={handleSave}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Identity Management</CardTitle>
          <CardDescription>
            Link additional identities to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => linkAccount("google")}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Link Google Account
            </Button>
            
            <Button
              variant="outline"
              onClick={() => linkAccount("github")}
              className="flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              Link GitHub Account
            </Button>
            
            <Button
              variant="outline"
              onClick={() => linkAccount("orcid")}
              className="flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Link ORCID Account
            </Button>
            
            <Button
              variant="outline"
              onClick={() => linkAccount("linkedin")}
              className="flex items-center gap-2"
            >
              <Linkedin className="w-4 h-4" />
              Link LinkedIn Account
            </Button>
          </div>
          
          {linkedAccounts.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Linked Accounts</h3>
              <ul className="space-y-2">
                {linkedAccounts.map((account, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{account.accountType}:</span>
                    <span>{account.email || account.externalId}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Billing Information</CardTitle>
          <CardDescription>
            Set your default billing information for project creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultIndex">Default Index (Billing Account)</Label>
            <Input
              id="defaultIndex"
              value={userInfo.defaultIndex}
              onChange={(e) => setUserInfo({ ...userInfo, defaultIndex: e.target.value })}
              placeholder="Enter billing account"
            />
          </div>
          
          <div>
            <Label htmlFor="defaultActivityCode">Default Activity Code</Label>
            <Input
              id="defaultActivityCode"
              value={userInfo.defaultActivityCode}
              onChange={(e) => setUserInfo({ ...userInfo, defaultActivityCode: e.target.value })}
              placeholder="Enter activity code"
            />
          </div>
          
          <Button onClick={handleSave}>Save Billing Info</Button>
        </CardContent>
      </Card>
    </div>
  )
}