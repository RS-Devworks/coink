// Interfaces para eventos do sistema usando EventEmitter do NestJS

// Eventos de Transação
export interface TransactionCreatedEvent {
  userId: string;
  transactionId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category?: string;
  description?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface TransactionUpdatedEvent {
  userId: string;
  transactionId: string;
  previousData: {
    amount: number;
    type: string;
    category?: string;
    description?: string;
  };
  newData: {
    amount: number;
    type: string;
    category?: string;
    description?: string;
  };
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface TransactionDeletedEvent {
  userId: string;
  transactionId: string;
  transactionData: {
    amount: number;
    type: string;
    category?: string;
    description?: string;
  };
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// Eventos de Autenticação
export interface UserLoggedInEvent {
  userId: string;
  loginMethod: 'email' | 'google' | 'github';
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface UserLoggedOutEvent {
  userId: string;
  sessionDuration?: number; // em milissegundos
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// Eventos de Alteração de Usuário
export interface UserPhotoUpdatedEvent {
  userId: string;
  previousPhoto?: string | null;
  newPhoto: string;
  fileName?: string;
  fileSize?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface UserEmailUpdatedEvent {
  userId: string;
  previousEmail: string;
  newEmail: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface UserPasswordUpdatedEvent {
  userId: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface PasswordResetRequestedEvent {
  userId: string;
  email: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// Eventos de Perfil
export interface UserProfileUpdatedEvent {
  userId: string;
  previousData: {
    name: string;
    email: string;
  };
  newData: {
    name: string;
    email: string;
  };
  changes: string[]; // ['name', 'email']
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// Union type para todos os eventos
export type AppEvent = 
  | TransactionCreatedEvent
  | TransactionUpdatedEvent
  | TransactionDeletedEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | UserPhotoUpdatedEvent
  | UserEmailUpdatedEvent
  | UserPasswordUpdatedEvent
  | PasswordResetRequestedEvent
  | UserProfileUpdatedEvent;
