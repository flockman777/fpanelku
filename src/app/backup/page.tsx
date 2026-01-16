'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Archive,
  RefreshCw,
  Search,
  ArrowLeft,
  Download,
  Trash2,
  HardDrive,
  Database,
  Calendar,
  Clock,
  Check,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'database' | 'files';
  path: string;
  size: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export default function BackupSystemPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  // Form states
  const [backupType, setBackupType] = useState<'full' | 'database' | 'files'>('full');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/backup', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load backups');
      }

      const data = await response.json();
      setBackups(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type: backupType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create backup');
      }

      setSuccess(`Backup creation started! ${backupType} backup is being created.`);
      setIsCreateModalOpen(false);
      loadBackups();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBackup) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/backup/${selectedBackup.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete backup');
      }

      setSuccess('Backup deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedBackup(null);
      loadBackups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'full':
        return (
          <Badge className="bg-blue-500 text-white">
            <Archive className="w-3 h-3 mr-1" />
            Full
          </Badge>
        );
      case 'database':
        return (
          <Badge className="bg-green-500 text-white">
            <Database className="w-3 h-3 mr-1" />
            Database
          </Badge>
        );
      case 'files':
        return (
          <Badge className="bg-purple-500 text-white">
            <HardDrive className="w-3 h-3 mr-1" />
            Files
          </Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredBackups = backups.filter(backup =>
    backup.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
  const completedBackups = backups.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <Archive className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Backup System
              </h1>
              <p className="text-sm text-gray-600">Automated backup management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadBackups} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Archive className="w-4 h-4" />
                  Create Backup
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Backup</DialogTitle>
                  <DialogDescription>
                    Choose the type of backup to create
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBackup}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Backup Type</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <div
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            backupType === 'full'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBackupType('full')}
                        >
                          <div className="flex items-center gap-3">
                            <Archive className="w-6 h-6 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">Full Backup</h3>
                              <p className="text-xs text-gray-500">Complete system backup</p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            backupType === 'database'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBackupType('database')}
                        >
                          <div className="flex items-center gap-3">
                            <Database className="w-6 h-6 text-green-600" />
                            <div>
                              <h3 className="font-semibold">Database Backup</h3>
                              <p className="text-xs text-gray-500">All databases</p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            backupType === 'files'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBackupType('files')}
                        >
                          <div className="flex items-center gap-3">
                            <HardDrive className="w-6 h-6 text-purple-600" />
                            <div>
                              <h3 className="font-semibold">Files Backup</h3>
                              <p className="text-xs text-gray-500">All files and directories</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Backup'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Backups</CardTitle>
              <Archive className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backups.length}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Size</CardTitle>
              <HardDrive className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <Check className="w-4 h-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBackups}</div>
            </CardContent>
          </Card>
        </div>

        {/* Backups List */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Backup History</CardTitle>
                <CardDescription>Manage your backups</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search backups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredBackups.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No backups found' : 'No backups yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Create your first backup'}
                </p>
                {!searchTerm && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Archive className="w-4 h-4" />
                    Create Your First Backup
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredBackups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          backup.status === 'completed'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : backup.status === 'failed'
                            ? 'bg-gradient-to-br from-red-500 to-orange-500'
                            : 'bg-gradient-to-br from-yellow-500 to-amber-500'
                        }`}>
                          <Archive className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{backup.name}</h3>
                            {getTypeBadge(backup.type)}
                            {getStatusBadge(backup.status)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Size: {formatSize(backup.size)}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(backup.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {backup.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="icon"
                            title="Download backup"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete backup"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBackup?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedBackup(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Backup'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
