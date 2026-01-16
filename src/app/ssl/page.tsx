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
  Shield,
  RefreshCw,
  ArrowLeft,
  Globe,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Unlock,
} from 'lucide-react';
import Link from 'next/link';

interface SSLCertificate {
  domain: string;
  status: 'active' | 'expired' | 'none' | 'pending';
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
}

export default function SSLManagementPage() {
  const [certificates, setCertificates] = useState<SSLCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');

  // Form states
  const [domainName, setDomainName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ssl', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load SSL certificates');
      }

      const data = await response.json();
      setCertificates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallSSL = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ssl/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          domain: domainName,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to install SSL');
      }

      setSuccess('SSL certificate installation started! This may take a few minutes.');
      setDomainName('');
      setEmail('');
      setIsInstallModalOpen(false);
      loadCertificates();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenewSSL = async (domain: string) => {
    if (!confirm(`Are you sure you want to renew SSL for ${domain}?`)) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ssl/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to renew SSL');
      }

      setSuccess('SSL renewal started! This may take a few minutes.');
      loadCertificates();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (cert: SSLCertificate) => {
    switch (cert.status) {
      case 'active':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            <Unlock className="w-3 h-3 mr-1" />
            No SSL
          </Badge>
        );
    }
  };

  const isExpiringSoon = (cert: SSLCertificate) => {
    return cert.status === 'active' && cert.daysRemaining <= 30;
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
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                SSL Management
              </h1>
              <p className="text-sm text-gray-600">Install and manage SSL certificates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={loadCertificates} disabled={isLoading}>
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isInstallModalOpen} onOpenChange={setIsInstallModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600">
                  <Lock className="w-4 h-4" />
                  Install SSL
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Install SSL Certificate</DialogTitle>
                  <DialogDescription>
                    Install a free Let's Encrypt SSL certificate for your domain
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInstallSSL}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="ssl-domain">Domain Name *</Label>
                      <Input
                        id="ssl-domain"
                        placeholder="example.com"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">
                        Make sure the domain points to this server
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ssl-email">Email Address *</Label>
                      <Input
                        id="ssl-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">
                        For SSL expiry notifications
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsInstallModalOpen(false);
                        setDomainName('');
                        setEmail('');
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        'Install Certificate'
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
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active SSL</CardTitle>
              <Lock className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expired</CardTitle>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.filter(c => c.status === 'expired').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expiring Soon</CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.filter(c => isExpiringSoon(c)).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">No SSL</CardTitle>
              <Unlock className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificates.filter(c => c.status === 'none').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates List */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader>
            <CardTitle>SSL Certificates</CardTitle>
            <CardDescription>Manage SSL certificates for your domains</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No SSL certificates</h3>
                <p className="text-gray-600 mb-4">
                  Install your first SSL certificate to secure your domains
                </p>
                <Button
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
                  onClick={() => setIsInstallModalOpen(true)}
                >
                  <Lock className="w-4 h-4" />
                  Install Your First SSL
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.domain}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isExpiringSoon(cert)
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          cert.status === 'active'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                            : 'bg-gray-100'
                        }`}>
                          <Shield className={`w-6 h-6 ${cert.status === 'active' ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{cert.domain}</h3>
                            {getStatusBadge(cert)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{cert.issuer}</span>
                            {cert.status !== 'none' && (
                              <>
                                <span>Valid to: {new Date(cert.validTo).toLocaleDateString()}</span>
                                {cert.status === 'active' && (
                                  <span className={`${isExpiringSoon(cert) ? 'text-yellow-600 font-medium' : ''}`}>
                                    {cert.daysRemaining} days remaining
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" asChild title="Visit site">
                          <a href={`https://${cert.domain}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        {cert.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRenewSSL(cert.domain)}
                          >
                            Renew
                          </Button>
                        )}
                        {cert.status === 'none' && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-emerald-600"
                            onClick={() => {
                              setDomainName(cert.domain);
                              setIsInstallModalOpen(true);
                            }}
                          >
                            Install
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
