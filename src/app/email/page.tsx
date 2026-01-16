'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ArrowLeft,
  Key,
  Copy,
  Check,
  MailPlus,
  Reply,
  Forward,
} from 'lucide-react';
import Link from 'next/link';

interface EmailAccount {
  id: string;
  email: string;
  password: string;
  quota: number;
  used: number;
  forwardTo: string | null;
  autoReply: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EmailManagementPage() {
  const [emails, setEmails] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailAccount | null>(null);
  const [copiedField, setCopiedField] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    quota: 1024,
    forwardTo: '',
    autoReply: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load email accounts');
      }

      const data = await response.json();
      setEmails(data || []);
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
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create email account');
      }

      setSuccess('Email account created successfully!');
      setFormData({ email: '', password: '', quota: 1024, forwardTo: '', autoReply: '' });
      setIsAddModalOpen(false);
      loadEmails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/email/${selectedEmail.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update email account');
      }

      setSuccess('Email account updated successfully!');
      setIsEditModalOpen(false);
      setSelectedEmail(null);
      setFormData({ email: '', password: '', quota: 1024, forwardTo: '', autoReply: '' });
      loadEmails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmail) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/email/${selectedEmail.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete email account');
      }

      setSuccess('Email account deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedEmail(null);
      loadEmails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (email: EmailAccount) => {
    setSelectedEmail(email);
    setFormData({
      email: email.email,
      password: email.password,
      quota: email.quota,
      forwardTo: email.forwardTo || '',
      autoReply: email.autoReply || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (email: EmailAccount) => {
    setSelectedEmail(email);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (email: EmailAccount) => {
    setSelectedEmail(email);
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

  const filteredEmails = emails.filter(email =>
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuota = emails.length * 1024;
  const totalUsed = emails.reduce((sum, email) => sum + email.used, 0);

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
            <Mail className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                Email Management
              </h1>
              <p className="text-sm text-gray-600">Manage email accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadEmails} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-sky-600">
                  <MailPlus className="w-4 h-4" />
                  Create Email
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Email Account</DialogTitle>
                  <DialogDescription>
                    Create a new email account for your domain
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-address">Email Address *</Label>
                      <Input
                        id="email-address"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-password">Password *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email-password"
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
                      <Label htmlFor="email-quota">Quota (MB)</Label>
                      <Input
                        id="email-quota"
                        type="number"
                        value={formData.quota}
                        onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) })}
                        min={100}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-forward">Forward To (optional)</Label>
                      <Input
                        id="email-forward"
                        type="email"
                        placeholder="forward@example.com"
                        value={formData.forwardTo}
                        onChange={(e) => setFormData({ ...formData, forwardTo: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-autoreply">Auto-Reply Message (optional)</Label>
                      <Textarea
                        id="email-autoreply"
                        placeholder="I'm currently away..."
                        value={formData.autoReply}
                        onChange={(e) => setFormData({ ...formData, autoReply: e.target.value })}
                        rows={3}
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
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Email'
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Emails</CardTitle>
              <Mail className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emails.length}</div>
            </CardContent>
          </Card>

          <Card className="border-sky-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Quota</CardTitle>
              <Mail className="w-4 h-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalQuota / 1024).toFixed(1)} GB</div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Used Space</CardTitle>
              <Mail className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalUsed / 1024).toFixed(2)} GB</div>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Email Accounts</CardTitle>
                <CardDescription>Manage and configure email accounts</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search emails..."
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
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No emails found' : 'No email accounts yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Create your first email account'}
                </p>
                {!searchTerm && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-blue-600 to-sky-600"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <MailPlus className="w-4 h-4" />
                    Create Your First Email
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{email.email}</h3>
                            {email.forwardTo && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Forward className="w-3 h-3 mr-1" />
                                Forwarding
                              </Badge>
                            )}
                            {email.autoReply && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Reply className="w-3 h-3 mr-1" />
                                Auto-Reply
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Quota: {email.quota} MB</span>
                            <span>Used: {email.used} MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openViewModal(email)}
                          title="View credentials"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(email)}
                          title="Edit email"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(email)}
                          title="Delete email"
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
            <DialogTitle>Email Credentials</DialogTitle>
            <DialogDescription>
              Connection details for {selectedEmail?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex gap-2">
                <Input value={selectedEmail?.email || ''} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(selectedEmail?.email || '', 'email')}
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input
                  type={copiedField === 'password' ? 'text' : 'password'}
                  value={selectedEmail?.password || ''}
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(selectedEmail?.password || '', 'password')}
                >
                  {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>IMAP Settings:</strong><br />
                <code className="text-xs">imap.example.com:993 (SSL)</code>
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>SMTP Settings:</strong><br />
                <code className="text-xs">smtp.example.com:587 (STARTTLS)</code>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedEmail(null);
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
            <DialogTitle className="text-red-600">Delete Email Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEmail?.email}"? This action cannot be undone and all emails will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedEmail(null);
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
                'Delete Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
