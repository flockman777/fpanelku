'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Server,
  HardDrive,
  Database,
  Globe,
  Users,
  Activity,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  Settings,
  Plus,
  RefreshCw,
  Mail,
  Archive,
  Shield,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStats, setServerStats] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    uptime: '0d 0h 0m',
  });
  const [domains, setDomains] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, domainsRes, dbRes, activitiesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/domains', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/databases', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/dashboard/activities'),
      ]);

      const [stats, domainsData, dbData, activitiesData] = await Promise.all([
        statsRes.json(),
        domainsRes.json(),
        dbRes.json(),
        activitiesRes.json(),
      ]);

      setServerStats(stats);
      setDomains(domainsData || []);
      setDatabases(dbData || []);
      setRecentActivities(activitiesData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
              FPanel Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Online
            </Badge>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-600">Here's what's happening with your server today.</p>
        </div>

        {/* Server Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">CPU Usage</CardTitle>
              <Cpu className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.cpu}%</div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Activity className="w-3 h-3" />
                Real-time monitoring
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Memory</CardTitle>
              <Server className="w-4 h-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.ram}%</div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Activity className="w-3 h-3" />
                RAM usage
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Disk Space</CardTitle>
              <HardDrive className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.disk}%</div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Activity className="w-3 h-3" />
                Storage used
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Uptime</CardTitle>
              <Clock className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.uptime}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                Server running
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-blue-200 hover:bg-blue-50"
                  asChild
                >
                  <Link href="/domains">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Domains</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-sky-200 hover:bg-sky-50"
                  asChild
                >
                  <Link href="/databases">
                    <Database className="w-5 h-5 text-sky-600" />
                    <span className="text-sm">Databases</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-indigo-200 hover:bg-indigo-50"
                  asChild
                >
                  <Link href="/files">
                    <HardDrive className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm">Files</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-green-200 hover:bg-green-50"
                  asChild
                >
                  <Link href="/ssl">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm">SSL</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-cyan-200 hover:bg-cyan-50"
                  asChild
                >
                  <Link href="/email">
                    <Mail className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm">Email</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-purple-200 hover:bg-purple-50"
                  asChild
                >
                  <Link href="/ftp">
                    <Server className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">FTP</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-orange-200 hover:bg-orange-50"
                  asChild
                >
                  <Link href="/cron">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="text-sm">Cron Jobs</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-blue-300 hover:bg-blue-100"
                  asChild
                >
                  <Link href="/backup">
                    <Archive className="w-5 h-5 text-blue-700" />
                    <span className="text-sm">Backups</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Domains Overview */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Domains
                  <Badge variant="secondary">{domains.length}</Badge>
                </CardTitle>
                <Button size="sm" className="gap-2" asChild>
                  <Link href="/domains">
                    <Plus className="w-4 h-4" />
                    Manage Domains
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {domains.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="mb-4">No domains yet</p>
                    <Button variant="outline" className="gap-2" asChild>
                      <Link href="/domains">
                        <Plus className="w-4 h-4" />
                        Add Your First Domain
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {domains.map((domain) => (
                        <div
                          key={domain.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Globe className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{domain.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {domain.sslEnabled ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    SSL Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    No SSL
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href="/domains">
                              Manage
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Databases Overview */}
            <Card className="border-sky-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-600" />
                  Databases
                  <Badge variant="secondary">{databases.length}</Badge>
                </CardTitle>
                <Button size="sm" className="gap-2" asChild>
                  <Link href="/databases">
                    <Plus className="w-4 h-4" />
                    Manage Databases
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {databases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="mb-4">No databases yet</p>
                    <Button variant="outline" className="gap-2" asChild>
                      <Link href="/databases">
                        <Plus className="w-4 h-4" />
                        Create Your First Database
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {databases.map((db) => (
                        <div
                          key={db.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                              <Database className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{db.name}</p>
                              <p className="text-xs text-gray-500">{db.sizeMB} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href="/databases">
                              Manage
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Server Status */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className="bg-green-500 text-white">Healthy</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Load Average</span>
                  <span className="text-sm font-medium">0.12, 0.08, 0.05</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connections</span>
                  <span className="text-sm font-medium">42</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processes</span>
                  <span className="text-sm font-medium">156</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={loadDashboardData}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {recentActivities.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                    ) : (
                      recentActivities.map((activity, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
