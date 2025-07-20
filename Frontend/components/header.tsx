"use client"

import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="lg:hidden">
          <h1 className="text-xl font-bold text-gray-900">Finance Tracker</h1>
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{user?.name}</span>
            {user?.role === "ADMIN" && <Badge variant="secondary">Admin</Badge>}
          </div>
        </div>
      </div>
    </header>
  )
}
