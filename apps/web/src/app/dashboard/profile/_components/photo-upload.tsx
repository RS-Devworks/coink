'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { uploadUserPhoto } from '@/server/actions/upload'
import { useEventLogger } from '@/lib/event-system'

interface PhotoUploadProps {
  currentPhotoUrl?: string
  userName: string
  onPhotoUploaded?: (url: string) => void
}

export default function PhotoUpload({ 
  currentPhotoUrl, 
  userName, 
  onPhotoUploaded 
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const eventLogger = useEventLogger()

  const handleFileSelect = (file: File) => {
    if (!file) return

    // Validações no frontend
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 5MB.')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Fazer upload
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 100)

      // Converter para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Enviar para API NestJS
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const { getSession } = await import('next-auth/react')
      const session = await getSession()

      const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          photoBase64: base64,
          fileName: file.name,
          sessionId: eventLogger.getQueueStatus().sessionId
        })
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('Foto enviada com sucesso!')
        onPhotoUploaded?.(base64) // Usar base64 como URL
        setPreviewUrl(null)

        // Log do evento
        await eventLogger.logAction('photo_upload_success', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
      } else {
        throw new Error(result.message || 'Erro ao enviar foto')
      }

    } catch (error) {
      console.error('❌ Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar foto')
      setPreviewUrl(null)

      // Log do erro
      await eventLogger.logAction('photo_upload_error', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Avatar atual */}
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
            <AvatarImage src={previewUrl || currentPhotoUrl} alt={userName} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-pink-400 to-purple-500 text-white">
              {userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        {/* Overlay de upload */}
        <motion.button
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openFileDialog}
          disabled={isUploading}
        >
          <Camera className="w-6 h-6 text-white" />
        </motion.button>

        {/* Progress ring durante upload */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-muted">
              <div 
                className="w-full h-full rounded-full border-4 border-pink-500 border-t-transparent animate-spin"
                style={{
                  background: `conic-gradient(from 0deg, #ec4899 ${uploadProgress * 3.6}deg, transparent ${uploadProgress * 3.6}deg)`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Área de drag and drop */}
      <Card 
        className={`transition-all duration-200 ${
          dragActive ? 'border-pink-500 bg-pink-50 dark:bg-pink-950' : 'border-dashed border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div>
              <p className="text-sm font-medium">
                Arraste uma foto aqui ou{' '}
                <button
                  onClick={openFileDialog}
                  className="text-pink-600 hover:text-pink-700 underline"
                  disabled={isUploading}
                >
                  clique para selecionar
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG ou WebP até 5MB
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Enviando... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Preview da imagem selecionada */}
      {previewUrl && !isUploading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Foto selecionada</p>
                  <p className="text-xs text-muted-foreground">
                    Pronto para enviar
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewUrl(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}
