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
  Globe,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  ExternalLink,
  Shield,
  Calendar,
  Folder,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Domain {
  id: string;
  name: string;
  sslEnabled: boolean;
  sslExpiry: string | null;
  path: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DomainsPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    path: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/domains', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load domains');
      }

      const data = await response.json();
      setDomains(data || []);
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
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add domain');
      }

      setSuccess('Domain added successfully!');
      setFormData({ name: '', path: '' });
      setIsAddModalOpen(false);
      loadDomains();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDomain) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/domains/${selectedDomain.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update domain');
      }

      setSuccess('Domain updated successfully!');
      setIsEditModalOpen(false);
      setSelectedDomain(null);
      setFormData({ name: '', path: '' });
      loadDomains();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDomain) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/domains/${selectedDomain.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete domain');
      }

      setSuccess('Domain deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedDomain(null);
      loadDomains();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (domain: Domain) => {
    setSelectedDomain(domain);
    setFormData({
      name: domain.name,
      path: domain.path || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsDeleteModalOpen(true);
  };

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatExpiryDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isSSLExpiring = (date: string | null) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const daysLeft = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30;
  };

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
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                Domains
              </h1>
              <p className="text-sm text-gray-600">Manage your domains</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadDomains} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700">
                  <Plus className="w-4 h-4" />
                  Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Domain</DialogTitle>
                  <DialogDescription>
                    Enter the domain details below to add it to your hosting.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain-name">Domain Name *</Label>
                      <Input
                        id="domain-name"
                        placeholder="example.com"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain-path">Document Root (optional)</Label>
                      <Input
                        id="domain-path"
                        placeholder="/var/www/example.com"
                        value={formData.path}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
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
                      className="bg-gradient-to-r from-blue-600 to-sky-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Domain'
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
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Domains</CardTitle>
              <Globe className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{domains.length}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">SSL Active</CardTitle>
              <Shield className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {domains.filter(d => d.sslEnabled).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">SSL Expiring</CardTitle>
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {domains.filter(d => d.sslExpiry && isSSLExpiring(d.sslExpiry)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and List */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Domains</CardTitle>
                <CardDescription>Manage and configure your domains</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search domains..."
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredDomains.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No domains found' : 'No domains yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Add your first domain to get started'}
                </p>
                {!searchTerm && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-blue-600 to-sky-600"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Domain
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredDomains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{domain.name}</h3>
                            {domain.sslEnabled ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                SSL
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                No SSL
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {domain.path || 'Default path'}
                            </span>
                            {domain.sslExpiry && (
                              <span className={`flex items-center gap-1 ${isSSLExpiring(domain.sslExpiry) ? 'text-yellow-600 font-medium' : ''}`}>
                                <Calendar className="w-3 h-3" />
                                Expires: {formatExpiryDate(domain.sslExpiry)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Button variant="outline" size="icon" asChild title="Visit site">
                          <a href={`http://${domain.name}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(domain)}
                          title="Edit domain"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(domain)}
                          title="Delete domain"
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
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>
              Update the domain details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-domain-name">Domain Name *</Label>
                <Input
                  id="edit-domain-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-domain-path">Document Root</Label>
                <Input
                  id="edit-domain-path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedDomain(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-sky-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Domain'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Domain</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDomain?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedDomain(null);
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
                'Delete Domain'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
