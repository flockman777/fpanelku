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
  HardDrive,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Upload,
  Folder,
  File,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Download,
  Copy,
  Move,
  Settings,
  FileText,
  Image,
  FileCode,
  Archive,
} from 'lucide-react';
import Link from 'next/link';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  modified: string;
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Form states
  const [folderName, setFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      setFiles(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: currentPath,
          name: folderName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create folder');
      }

      setSuccess('Folder created successfully!');
      setFolderName('');
      setIsCreateFolderModalOpen(false);
      loadFiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPath: selectedFile.path,
          newName: newFileName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename');
      }

      setSuccess('Renamed successfully!');
      setNewFileName('');
      setIsRenameModalOpen(false);
      setSelectedFile(null);
      loadFiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: file.path,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      setSuccess('Deleted successfully!');
      loadFiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('path', currentPath);

      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('files', uploadFiles[i]);
      }

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload');
      }

      setSuccess(`${uploadFiles.length} file(s) uploaded successfully!`);
      setUploadFiles(null);
      setIsUploadModalOpen(false);
      loadFiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = (file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    }
  };

  const handleGoBack = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: any } = {
      jpg: Image,
      jpeg: Image,
      png: Image,
      gif: Image,
      txt: FileText,
      html: FileCode,
      css: FileCode,
      js: FileCode,
      json: FileCode,
      zip: Archive,
      rar: Archive,
      tar: Archive,
      gz: Archive,
    };

    const Icon = icons[ext || ''] || File;
    return <Icon className="w-8 h-8 text-gray-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const directories = filteredFiles.filter(f => f.type === 'directory');
  const regularFiles = filteredFiles.filter(f => f.type === 'file');
  const totalSize = regularFiles.reduce((sum, f) => sum + f.size, 0);

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
            <HardDrive className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                File Manager
              </h1>
              <p className="text-sm text-gray-600">Manage your files and folders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadFiles} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
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

        {/* Path Navigation & Actions */}
        <Card className="border-indigo-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Path */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleGoBack}
                  disabled={currentPath === '/'}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2 text-sm font-mono overflow-hidden text-ellipsis">
                  {currentPath || '/'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateFolderModalOpen(true)}
                  className="gap-2"
                >
                  <Folder className="w-4 h-4" />
                  New Folder
                </Button>
                <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
                      <Upload className="w-4 h-4" />
                      Upload Files
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Files</DialogTitle>
                      <DialogDescription>
                        Select files to upload to {currentPath}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="upload-files">Files</Label>
                          <Input
                            id="upload-files"
                            type="file"
                            multiple
                            onChange={(e) => setUploadFiles(e.target.files)}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsUploadModalOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Upload'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-indigo-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Files</CardTitle>
              <File className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regularFiles.length}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Folders</CardTitle>
              <Folder className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{directories.length}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Size</CardTitle>
              <HardDrive className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
            </CardContent>
          </Card>
        </div>

        {/* File List */}
        <Card className="border-indigo-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Files & Folders</CardTitle>
                <CardDescription>{currentPath || '/'}</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
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
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No files found' : 'This folder is empty'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Upload files or create a folder'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {/* Directories */}
                  {directories.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
                      onClick={() => handleNavigate(file)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{file.name}</h3>
                          <p className="text-xs text-gray-500">Directory</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Folder className="w-3 h-3 mr-1" />
                          Folder
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Files */}
                  {regularFiles.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{file.name}</h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatSize(file.size)}</span>
                            <span>{new Date(file.modified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedFile(file);
                            setNewFileName(file.name);
                            setIsRenameModalOpen(true);
                          }}
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file)}
                          title="Delete"
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

      {/* Create Folder Modal */}
      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter folder name to create in {currentPath}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFolder}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name *</Label>
                <Input
                  id="folder-name"
                  placeholder="my-folder"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateFolderModalOpen(false);
                  setFolderName('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Folder'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Modal */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>
              Rename "{selectedFile?.name}" to a new name
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">New Name *</Label>
                <Input
                  id="new-name"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRenameModalOpen(false);
                  setSelectedFile(null);
                  setNewFileName('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Renaming...
                  </>
                ) : (
                  'Rename'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
