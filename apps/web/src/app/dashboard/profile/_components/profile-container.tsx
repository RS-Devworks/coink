'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {useRouter} from 'next/router'
import { toast } from 'sonner'
import { getUserProfile, updateUserProfile, updateUserPassword, deleteUserAccount } from '@/server/actions/profile'
import ProfileHeader from './profile-header'
import ProfileTabs from './profile-tabs'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
  lastAccess: string | null
  profilePhoto?: string | null
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <motion.div 
        className="h-48 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-32 bg-muted/50 rounded-lg animate-pulse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
      
      {/* Tabs Skeleton */}
      <motion.div 
        className="h-96 bg-muted/50 rounded-lg animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
    </div>
  )
}

export default function ProfileContainer() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()

  // Buscar dados do perfil
  const { 
    data: profileData, 
    isLoading: profileLoading,
    error: profileError 
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const result = await getUserProfile()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data as UserProfile
    },
    enabled: status === 'authenticated',
  })

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Perfil atualizado com sucesso!')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      } else {
        toast.error(result.error || 'Erro ao atualizar perfil')
      }
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil')
    }
  })

  // Mutation para alterar senha
  const updatePasswordMutation = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Senha alterada com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao alterar senha')
      }
    },
    onError: () => {
      toast.error('Erro ao alterar senha')
    }
  })

  // Mutation para excluir conta
  const deleteAccountMutation = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Conta excluída com sucesso!')
        signOut({ callbackUrl: '/' })
      } else {
        toast.error(result.error || 'Erro ao excluir conta')
      }
    },
    onError: () => {
      toast.error('Erro ao excluir conta')
    }
  })

  const handleUpdateProfile = (data: { name: string; email: string }) => {
    updateProfileMutation.mutate(data)
  }

  const handleUpdatePassword = (data: { currentPassword: string; newPassword: string }) => {
    updatePasswordMutation.mutate(data)
  }

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate()
  }

  if (status === 'loading' || profileLoading) {
    return <ProfileSkeleton />
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (profileError || !profileData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-64"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold">Erro ao carregar perfil</h3>
          <p className="text-muted-foreground">Tente novamente mais tarde</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header com informações principais */}
      <ProfileHeader profile={profileData} />
      
      
      {/* Tabs com configurações */}
      <ProfileTabs
        profile={profileData}
        onUpdateProfile={handleUpdateProfile}
        onUpdatePassword={handleUpdatePassword}
        onDeleteAccount={handleDeleteAccount}
        isUpdatingProfile={updateProfileMutation.isPending}
        isUpdatingPassword={updatePasswordMutation.isPending}
        isDeletingAccount={deleteAccountMutation.isPending}
      />
    </div>
  )
}
