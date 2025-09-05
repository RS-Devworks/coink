'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Edit3, Calendar } from 'lucide-react'
import PhotoUpload from './photo-upload'
import EditProfileDialog from './edit-profile-dialog'

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
  lastAccess: string | null
  profilePhoto?: string | null
}

interface ProfileHeaderProps {
  profile: UserProfile
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const memberSince = new Date(profile.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long'
  })

  const handlePhotoUploaded = (url: string) => {
    // Atualizar o cache do perfil com a nova foto
    queryClient.setQueryData(['user-profile'], (oldData: any) => ({
      ...oldData,
      profilePhoto: url
    }))
    setIsPhotoDialogOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-500/20 rounded-full blur-2xl" />
        
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.profilePhoto || undefined} alt={profile.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                    {profile.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {/* Upload button overlay */}
              <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Alterar Foto do Perfil</DialogTitle>
                  </DialogHeader>
                  <PhotoUpload
                    currentPhotoUrl={profile.profilePhoto || undefined}
                    userName={profile.name}
                    onPhotoUploaded={handlePhotoUploaded}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {profile.name}
                  </h1>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Ativo
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-lg">
                  {profile.email}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Membro desde {memberSince}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>
                    {profile.lastAccess 
                      ? `Último acesso em ${new Date(profile.lastAccess).toLocaleDateString('pt-BR')}`
                      : 'Primeiro acesso'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <EditProfileDialog profile={profile}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </motion.div>
            </EditProfileDialog>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
