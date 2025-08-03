"use client"

import { ReactNode, createContext, useContext, useState, useEffect } from "react"
import { AdminNavigation } from "./admin-navigation"

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface AdminLayoutProps {
  children: ReactNode
}

interface AdminPageLayoutProps {
  children: ReactNode
  user: any
  onLogout: () => void
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const { isCollapsed } = useSidebar()
  const [isDesktop, setIsDesktop] = useState(false)
  
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkIsDesktop()
    window.addEventListener('resize', checkIsDesktop)
    
    return () => window.removeEventListener('resize', checkIsDesktop)
  }, [])
  
  const marginLeft = isDesktop ? (isCollapsed ? '80px' : '280px') : '0px'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Content with dynamic margin based on sidebar state */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft }}
      >
        <div className="lg:hidden">
          {/* Mobile spacing */}
          <div className="h-4"></div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
    </SidebarProvider>
  )
}

function AdminPageLayoutInner({ children, user, onLogout }: AdminPageLayoutProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  
  return (
    <>
      <AdminNavigation 
        user={user} 
        onLogout={onLogout} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
    </>
  )
}

export function AdminPageLayout({ children, user, onLogout }: AdminPageLayoutProps) {
  return (
    <SidebarProvider>
      <AdminPageLayoutInner user={user} onLogout={onLogout}>
        {children}
      </AdminPageLayoutInner>
    </SidebarProvider>
  )
}