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
  Server,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ArrowLeft,
  Key,
  Copy,
  Check,
  HardDrive,
} from 'lucide-react';
import Link from 'next/link';

interface FTPUser {
  id: string;
  username: string;
  password: string;
  homePath: string;
  quota: number;
  used: number;
  createdAt: string;
  updatedAt: string;
}

export default function FTPManagementPage() {
  const [ftpUsers, setFtpUsers] = useState<FTPUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FTPUser | null>(null);
  const [copiedField, setCopiedField] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    homePath: '/',
    quota: 1024,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFTPUsers();
  }, []);

  const loadFTPUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ftp', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load FTP users');
      }

      const data = await response.json();
      setFtpUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ftp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create FTP user');
      }

      setSuccess('FTP user created successfully!');
      setFormData({ username: '', password: '', homePath: '/', quota: 1024 });
      setIsAddModalOpen(false);
      loadFTPUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ftp/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update FTP user');
      }

      setSuccess('FTP user updated successfully!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setFormData({ username: '', password: '', homePath: '/', quota: 1024 });
      loadFTPUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ftp/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete FTP user');
      }

      setSuccess('FTP user deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadFTPUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: FTPUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      homePath: user.homePath,
      quota: user.quota,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: FTPUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (user: FTPUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const filteredUsers = ftpUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuota = ftpUsers.reduce((sum, user) => sum + user.quota, 0);
  const totalUsed = ftpUsers.reduce((sum, user) => sum + user.used, 0);

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
            <Server className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FTP Management
              </h1>
              <p className="text-sm text-gray-600">Manage FTP users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadFTPUsers} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus className="w-4 h-4" />
                  Add FTP User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New FTP User</DialogTitle>
                  <DialogDescription>
                    Create a new FTP user for file transfers
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="ftp-username">Username *</Label>
                      <Input
                        id="ftp-username"
                        placeholder="ftpuser"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ftp-password">Password *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ftp-password"
                          type="text"
                          placeholder="Enter password or generate one"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generatePassword}
                          title="Generate random password"
                          disabled={isSubmitting}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ftp-path">Home Path</Label>
                      <Input
                        id="ftp-path"
                        placeholder="/var/www/html"
                        value={formData.homePath}
                        onChange={(e) => setFormData({ ...formData, homePath: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ftp-quota">Quota (MB)</Label>
                      <Input
                        id="ftp-quota"
                        type="number"
                        value={formData.quota}
                        onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) })}
                        min={100}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create FTP User'
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
          <Card className="border-purple-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total FTP Users</CardTitle>
              <Server className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ftpUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Quota</CardTitle>
              <HardDrive className="w-4 h-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalQuota / 1024).toFixed(1)} GB</div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Used Space</CardTitle>
              <HardDrive className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalUsed / 1024).toFixed(2)} GB</div>
            </CardContent>
          </Card>
        </div>

        {/* FTP Users List */}
        <Card className="border-purple-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>FTP Users</CardTitle>
                <CardDescription>Manage and configure FTP accounts</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search FTP users..."
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
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Server className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No FTP users found' : 'No FTP users yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Create your first FTP user'}
                </p>
                {!searchTerm && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First FTP User
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Server className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{user.username}</h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Path: {user.homePath}</span>
                            <span>Quota: {user.quota} MB</span>
                            <span>Used: {user.used} MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openViewModal(user)}
                          title="View credentials"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(user)}
                          title="Delete user"
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

      {/* View Credentials Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>FTP Credentials</DialogTitle>
            <DialogDescription>
              Connection details for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Server</Label>
              <Input value="ftp.example.com" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex gap-2">
                <Input value={selectedUser?.username || ''} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(selectedUser?.username || '', 'username')}
                >
                  {copiedField === 'username' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input
                  type={copiedField === 'password' ? 'text' : 'password'}
                  value={selectedUser?.password || ''}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(selectedUser?.password || '', 'password')}
                >
                  {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                <strong>Connection Details:</strong><br />
                <code className="text-xs break-all">
                  ftp://ftp.example.com:21
                </code>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedUser(null);
                setCopiedField('');
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete FTP User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedUser?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
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
                'Delete FTP User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
