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
  Clock,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ArrowLeft,
  Play,
  Pause,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

interface CronJob {
  id: string;
  name: string;
  command: string;
  schedule: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
  updatedAt: string;
}

const CRON_TEMPLATES = [
  { name: 'Every minute', schedule: '* * * * *' },
  { name: 'Every 5 minutes', schedule: '*/5 * * * *' },
  { name: 'Every hour', schedule: '0 * * * *' },
  { name: 'Every day at midnight', schedule: '0 0 * * *' },
  { name: 'Every day at 6 AM', schedule: '0 6 * * *' },
  { name: 'Every week on Sunday', schedule: '0 0 * * 0' },
  { name: 'Every month on 1st', schedule: '0 0 1 * *' },
];

export default function CronJobsPage() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    command: '',
    schedule: '* * * * *',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCronJobs();
  }, []);

  const loadCronJobs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cron', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load cron jobs');
      }

      const data = await response.json();
      setCronJobs(data || []);
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
      const response = await fetch('/api/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create cron job');
      }

      setSuccess('Cron job created successfully!');
      setFormData({ name: '', command: '', schedule: '* * * * *' });
      setIsAddModalOpen(false);
      loadCronJobs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cron/${selectedJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cron job');
      }

      setSuccess('Cron job updated successfully!');
      setIsEditModalOpen(false);
      setSelectedJob(null);
      setFormData({ name: '', command: '', schedule: '* * * * *' });
      loadCronJobs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (job: CronJob) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cron/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...job, enabled: !job.enabled }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle cron job');
      }

      loadCronJobs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cron/${selectedJob.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete cron job');
      }

      setSuccess('Cron job deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedJob(null);
      loadCronJobs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (job: CronJob) => {
    setSelectedJob(job);
    setFormData({
      name: job.name,
      command: job.command,
      schedule: job.schedule,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (job: CronJob) => {
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  };

  const filteredJobs = cronJobs.filter(job =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.command.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeJobs = cronJobs.filter(j => j.enabled).length;

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
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Cron Jobs
              </h1>
              <p className="text-sm text-gray-600">Schedule automated tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadCronJobs} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600">
                  <Plus className="w-4 h-4" />
                  Add Cron Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Cron Job</DialogTitle>
                  <DialogDescription>
                    Schedule a command to run at specific intervals
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cron-name">Job Name *</Label>
                      <Input
                        id="cron-name"
                        placeholder="Daily Backup"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cron-command">Command *</Label>
                      <Input
                        id="cron-command"
                        placeholder="/usr/bin/php /path/to/script.php"
                        value={formData.command}
                        onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cron-schedule">Schedule (Cron Expression) *</Label>
                      <Input
                        id="cron-schedule"
                        placeholder="* * * * *"
                        value={formData.schedule}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">
                        Format: minute hour day month weekday
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Quick Templates</Label>
                      <div className="flex flex-wrap gap-2">
                        {CRON_TEMPLATES.map((template) => (
                          <Button
                            key={template.schedule}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, schedule: template.schedule })}
                            disabled={isSubmitting}
                          >
                            {template.name}
                          </Button>
                        ))}
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
                      className="bg-gradient-to-r from-orange-600 to-amber-600"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Cron Job'
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
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="border-orange-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cronJobs.length}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
              <Play className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Cron Jobs List */}
        <Card className="border-orange-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cron Jobs</CardTitle>
                <CardDescription>Manage scheduled tasks</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search cron jobs..."
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
                <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No cron jobs found' : 'No cron jobs yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Create your first cron job'}
                </p>
                {!searchTerm && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Cron Job
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          job.enabled
                            ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                            : 'bg-gray-100'
                        }`}>
                          <Calendar className={`w-6 h-6 ${job.enabled ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{job.name}</h3>
                            {job.enabled ? (
                              <Badge className="bg-green-500 text-white">
                                <Play className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                <Pause className="w-3 h-3 mr-1" />
                                Paused
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <code className="bg-gray-100 px-2 py-1 rounded">{job.schedule}</code>
                          </div>
                          <div className="text-xs text-gray-600 truncate mt-1">
                            {job.command}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggle(job)}
                          title={job.enabled ? 'Pause' : 'Start'}
                        >
                          {job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(job)}
                          title="Edit job"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteModal(job)}
                          title="Delete job"
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
            <DialogTitle className="text-red-600">Delete Cron Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedJob(null);
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
                'Delete Cron Job'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
