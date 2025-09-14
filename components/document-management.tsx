'use client'

import { useState, useRef } from 'react'
import { FileText, Upload, Download, Trash2, Plus, Eye, FileCheck, AlertCircle, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  useShipmentDocuments,
  useDocumentTemplates,
  useDocumentGeneration,
  useBulkDocuments
} from '@/hooks/use-document-management'
import type { ShippingDocument, DocumentType, DocumentStatus, DocumentTemplate } from '@/lib/greenscreens-api'

interface DocumentManagementProps {
  shipmentId?: string
  onDocumentSelect?: (document: ShippingDocument) => void
}

export function DocumentManagement({ shipmentId, onDocumentSelect }: DocumentManagementProps) {
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    refetch: refetchDocuments
  } = useShipmentDocuments(shipmentId || '')

  const {
    templates,
    loading: templatesLoading,
    error: templatesError
  } = useDocumentTemplates()

  const {
    generateDocument,
    loading: generationLoading,
    error: generationError
  } = useDocumentGeneration()

  const {
    uploadMultipleDocuments,
    deleteMultipleDocuments,
    loading: bulkLoading
  } = useBulkDocuments()

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'bill_of_lading', label: 'Bill of Lading' },
    { value: 'commercial_invoice', label: 'Commercial Invoice' },
    { value: 'packing_list', label: 'Packing List' },
    { value: 'customs_declaration', label: 'Customs Declaration' },
    { value: 'certificate_of_origin', label: 'Certificate of Origin' },
    { value: 'insurance_certificate', label: 'Insurance Certificate' },
    { value: 'delivery_receipt', label: 'Delivery Receipt' },
    { value: 'proof_of_delivery', label: 'Proof of Delivery' },
    { value: 'other', label: 'Other' }
  ]

  const documentStatuses: { value: DocumentStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <FileCheck className="h-4 w-4" />
      case 'rejected':
      case 'expired':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!shipmentId) return

    const formData = new FormData(event.currentTarget)
    const file = formData.get('file') as File
    const type = formData.get('type') as DocumentType
    const name = formData.get('name') as string

    if (!file || !type || !name) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await uploadDocument({ file, type, name })
      setUploadDialogOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleDocumentGeneration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!shipmentId || !selectedTemplate) return

    const formData = new FormData(event.currentTarget)
    const data: Record<string, any> = {}
    
    selectedTemplate.fields.forEach(field => {
      const value = formData.get(field.name)
      if (value) {
        data[field.name] = field.type === 'number' ? Number(value) : value
      }
    })

    try {
      await generateDocument({
        template_id: selectedTemplate.id,
        shipment_id: shipmentId,
        data,
        format: 'pdf'
      })
      setGenerateDialogOpen(false)
      setSelectedTemplate(null)
      refetchDocuments()
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return

    try {
      await deleteMultipleDocuments(selectedDocuments)
      setSelectedDocuments([])
      refetchDocuments()
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!shipmentId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a shipment to manage documents</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Document Management</h2>
          <Badge variant="outline">{documents.length} documents</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedDocuments.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedDocuments.length})
            </Button>
          )}
          
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Document</DialogTitle>
                <DialogDescription>
                  Generate a document from a template
                </DialogDescription>
              </DialogHeader>
              
              {!selectedTemplate ? (
                <div className="space-y-4">
                  <Label>Select Template</Label>
                  <ScrollArea className="h-48">
                    {templatesLoading ? (
                      <div className="text-center py-4">Loading templates...</div>
                    ) : templatesError ? (
                      <Alert>
                        <AlertDescription>{templatesError}</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2">
                        {templates.map(template => (
                          <Card
                            key={template.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <CardContent className="p-3">
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                              <Badge variant="outline" className="mt-2">
                                {template.type.replace('_', ' ')}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              ) : (
                <form onSubmit={handleDocumentGeneration} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{selectedTemplate.name}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      Back
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {selectedTemplate.fields.map(field => (
                        <div key={field.name}>
                          <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === 'select' ? (
                            <Select name={field.name} required={field.required}>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map(option => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              id={field.name}
                              name={field.name}
                              required={field.required}
                              placeholder={field.label}
                            />
                          ) : (
                            <Input
                              id={field.name}
                              name={field.name}
                              type={field.type}
                              required={field.required}
                              placeholder={field.label}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {generationError && (
                    <Alert>
                      <AlertDescription>{generationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" disabled={generationLoading} className="w-full">
                    {generationLoading ? 'Generating...' : 'Generate Document'}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new document for this shipment
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="file">File *</Label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Document Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Enter document name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Document Type *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {documentsError && (
                  <Alert>
                    <AlertDescription>{documentsError}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" disabled={documentsLoading} className="w-full">
                  {documentsLoading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {documentStatuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DocumentType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} of {documents.length} documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : documentsError ? (
            <Alert>
              <AlertDescription>{documentsError}</AlertDescription>
            </Alert>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your filters'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document, index) => (
                <div key={document.id}>
                  <div className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => toggleDocumentSelection(document.id)}
                      className="rounded"
                    />
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(document.status)}
                      <span className="text-lg">
                        {document.mime_type.includes('pdf') ? '📄' : 
                         document.mime_type.includes('image') ? '🖼️' : '📄'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{document.name}</h4>
                        <Badge variant="outline">
                          {documentTypes.find(t => t.value === document.type)?.label || document.type}
                        </Badge>
                        <Badge className={getStatusColor(document.status)}>
                          {document.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>Uploaded {new Date(document.uploaded_at).toLocaleDateString()}</span>
                        <span>by {document.uploaded_by}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDocumentSelect?.(document)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadDocument(document.id, document.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < filteredDocuments.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}