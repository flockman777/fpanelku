'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  Search,
  Key,
  HardDrive,
  Calendar,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Database {
  id: string;
  name: string;
  username: string;
  password: string;
  sizeMB: number;
  createdAt: string;
  updatedAt: string;
}

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [copiedField, setCopiedField] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/databases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load databases');
      }

      const data = await response.json();
      setDatabases(data || []);
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
      const response = await fetch('/api/databases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add database');
      }

      setSuccess('Database created successfully!');
      setFormData({ name: '', username: '', password: '' });
      setIsAddModalOpen(false);
      loadDatabases();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatabase) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/databases/${selectedDatabase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update database');
      }

      setSuccess('Database updated successfully!');
      setIsEditModalOpen(false);
      setSelectedDatabase(null);
      setFormData({ name: '', username: '', password: '' });
      loadDatabases();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDatabase) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/databases/${selectedDatabase.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete database');
      }

      setSuccess('Database deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedDatabase(null);
      loadDatabases();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (database: Database) => {
    setSelectedDatabase(database);
    setFormData({
      name: database.name,
      username: database.username,
      password: database.password,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (database: Database) => {
    setSelectedDatabase(database);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (database: Database) => {
    setSelectedDatabase(database);
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

  const filteredDatabases = databases.filter(db =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    db.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSize = databases.reduce((sum, db) => sum + db.sizeMB, 0);

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
            <Database className="w-8 h-8 text-sky-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Databases
              </h1>
              <p className="text-sm text-gray-600">Manage your databases</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadDatabases} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700">
                  <Plus className="w-4 h-4" />
                  Create Database
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Database</DialogTitle>
                  <DialogDescription>
                    Enter the database details below to create a new MySQL database.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="db-name">Database Name *</Label>
                      <Input
                        id="db-name"
                        placeholder="my_database"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="db-username">Username *</Label>
                      <Input
                        id="db-username"
                        placeholder="db_user"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="db-password">Password *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="db-password"
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
                      className="bg-gradient-to-r from-sky-600 to-blue-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Database'
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-sky-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Databases</CardTitle>
              <Database className="w-4 h-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{databases.length}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Size</CardTitle>
              <HardDrive className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSize} MB</div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Size</CardTitle>
              <Database className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {databases.length > 0 ? Math.round(totalSize / databases.length) : 0} MB
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and List */}
        <Card className="border-sky-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Databases</CardTitle>
                <CardDescription>Manage and configure your databases</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search databases..."
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
                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              </div>
            ) : filteredDatabases.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No databases found' : 'No databases yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Create your first database to get started'}
                </p>
                {!searchTerm && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-sky-600 to-blue-600"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Database
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredDatabases.map((db) => (
                    <div
                      key={db.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1">{db.name}</h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Key className="w-3 h-3" />
                              {db.username}
                            </span>
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {db.sizeMB} MB
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(db.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openViewModal(db)}
                          title="View credentials"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(db)}
                          title="Edit database"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(db)}
                          title="Delete database"
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Database</DialogTitle>
            <DialogDescription>
              Update the database details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-db-name">Database Name *</Label>
                <Input
                  id="edit-db-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-db-username">Username *</Label>
                <Input
                  id="edit-db-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-db-password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-db-password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedDatabase(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-sky-600 to-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Database'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Credentials Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Database Credentials</DialogTitle>
            <DialogDescription>
              Connection details for {selectedDatabase?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Database Name</Label>
              <div className="flex gap-2">
                <Input value={selectedDatabase?.name || ''} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(selectedDatabase?.name || '', 'name')}
                >
                  {copiedField === 'name' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex gap-2">
                <Input value={selectedDatabase?.username || ''} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(selectedDatabase?.username || '', 'username')}
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
                  value={selectedDatabase?.password || ''}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(selectedDatabase?.password || '', 'password')}
                >
                  {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Connection String:</strong><br />
                <code className="text-xs break-all">
                  mysql://{selectedDatabase?.username}:{'••••••••'}@localhost/{selectedDatabase?.name}
                </code>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedDatabase(null);
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
            <DialogTitle className="text-red-600">Delete Database</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDatabase?.name}"? This action cannot be undone and all data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedDatabase(null);
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Database'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
