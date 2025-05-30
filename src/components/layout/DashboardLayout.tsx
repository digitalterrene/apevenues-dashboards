
"use client"
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { 
  Home, 
  Building2, 
  User, 
  LogOut,
  CreditCard,
  Calendar
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const DashboardLayout = ({children}:any) => {
  const { user, logout } = useAuth();
  const router = useRouter();  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/dashboard/properties', label: 'Properties', icon: Building2 },
    { path: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
    { path: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { path: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-orange-600">APE Dashboard</h1>
                <p className="text-xs text-gray-600">Business Dashboard</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.path)}
                      className="w-full"
                    >
                      <button
                        onClick={() => router.push(item.path)}
                        className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-colors ${
                          isActive(item.path)
                            ? 'bg-orange-100 text-orange-600'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900">{user?.businessName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 ml-52 pl-10">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                Welcome back, {user?.contactPerson}
              </h2>
            </div>
          </header>
          <div className="flex-1 p-6">
          {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
