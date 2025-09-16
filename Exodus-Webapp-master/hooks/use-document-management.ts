import { useState, useEffect, useCallback } from 'react'
import type {
  ShippingDocument,
  DocumentType,
  DocumentStatus,
  DocumentTemplate,
  DocumentGenerationRequest,
  DocumentUploadRequest
} from '@/lib/greenscreens-api'

// Hook for managing documents for a specific shipment
export function useShipmentDocuments(shipmentId: string) {
  const [documents, setDocuments] = useState<ShippingDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    if (!shipmentId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/greenscreens/shipments/${shipmentId}/documents`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch documents')
      }

      setDocuments(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [shipmentId])

  const uploadDocument = async (uploadRequest: Omit<DocumentUploadRequest, 'shipment_id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', uploadRequest.file)
      formData.append('shipment_id', shipmentId)
      formData.append('type', uploadRequest.type)
      formData.append('name', uploadRequest.name)
      if (uploadRequest.metadata) {
        formData.append('metadata', JSON.stringify(uploadRequest.metadata))
      }

      const response = await fetch('/api/greenscreens/documents/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload document')
      }

      // Add the new document to the list
      setDocuments(prev => [...prev, result.data])
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/greenscreens/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete document')
      }

      // Remove the document from the list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/greenscreens/documents/${documentId}/download`)
      
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    refetch: fetchDocuments
  }
}

// Hook for managing document templates
export function useDocumentTemplates(type?: DocumentType) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = type ? new URLSearchParams({ type }) : ''
      const response = await fetch(`/api/greenscreens/documents/templates${params ? '?' + params.toString() : ''}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch templates')
      }

      setTemplates(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  }
}

// Hook for document generation
export function useDocumentGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateDocument = async (request: DocumentGenerationRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/greenscreens/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate document')
      }

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    generateDocument,
    loading,
    error
  }
}

// Hook for document operations (get, update status)
export function useDocument(documentId: string) {
  const [document, setDocument] = useState<ShippingDocument | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocument = useCallback(async () => {
    if (!documentId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/greenscreens/documents/${documentId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch document')
      }

      setDocument(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const updateStatus = async (status: DocumentStatus) => {
    if (!documentId) return
    
    try {
      const response = await fetch(`/api/greenscreens/documents/${documentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update document status')
      }

      setDocument(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  useEffect(() => {
    fetchDocument()
  }, [fetchDocument])

  return {
    document,
    loading,
    error,
    updateStatus,
    refetch: fetchDocument
  }
}

// Hook for bulk document operations
export function useBulkDocuments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadMultipleDocuments = async (
    shipmentId: string,
    files: { file: File; type: DocumentType; name: string; metadata?: Record<string, any> }[]
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const uploadPromises = files.map(async ({ file, type, name, metadata }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('shipment_id', shipmentId)
        formData.append('type', type)
        formData.append('name', name)
        if (metadata) {
          formData.append('metadata', JSON.stringify(metadata))
        }

        const response = await fetch('/api/greenscreens/documents/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || `Failed to upload ${name}`)
        }

        return result.data
      })

      const results = await Promise.all(uploadPromises)
      return results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMultipleDocuments = async (documentIds: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const deletePromises = documentIds.map(async (documentId) => {
        const response = await fetch(`/api/greenscreens/documents/${documentId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || `Failed to delete document ${documentId}`)
        }

        return documentId
      })

      const results = await Promise.all(deletePromises)
      return results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    uploadMultipleDocuments,
    deleteMultipleDocuments,
    loading,
    error
  }
}