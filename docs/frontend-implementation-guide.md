# Guia de Implementação do Frontend para Autenticação OTP

Este documento detalha a implementação do frontend React para o sistema de autenticação OTP, incluindo componentes, serviços e fluxo de usuário.

## Estrutura do Projeto Frontend

```
src/
├── components/           # Componentes React
│   ├── AuthFlow/         # Componentes relacionados à autenticação
│   │   ├── OtpInput.tsx  # Componente de entrada de OTP
│   │   ├── PhoneInput.tsx # Componente de entrada de telefone
│   │   └── EmailInput.tsx # Componente de entrada de email
│   ├── Layout/           # Componentes de layout
│   │   ├── Header.tsx    # Cabeçalho da aplicação
│   │   └── Footer.tsx    # Rodapé da aplicação
│   └── UI/               # Componentes de UI reutilizáveis
│       ├── Button.tsx    # Botão estilizado
│       ├── Card.tsx      # Cartão estilizado
│       └── Alert.tsx     # Componente de alerta
├── contexts/             # Contextos React
│   └── AuthContext.tsx   # Contexto de autenticação
├── hooks/                # Hooks personalizados
│   ├── useAuth.ts        # Hook para autenticação
│   └── useOtp.ts         # Hook para operações de OTP
├── pages/                # Páginas da aplicação
│   ├── Home.tsx          # Página inicial
│   ├── Login.tsx         # Página de login
│   ├── Verify.tsx        # Página de verificação de OTP
│   └── Dashboard.tsx     # Página de dashboard (protegida)
├── services/             # Serviços para comunicação com API
│   ├── api.ts            # Configuração base da API
│   ├── auth.ts           # Serviço de autenticação
│   └── otp.ts            # Serviço de OTP
├── types/                # Definições de tipos TypeScript
│   └── index.ts          # Tipos compartilhados
├── utils/                # Utilitários
│   ├── storage.ts        # Utilitários de armazenamento local
│   └── validation.ts     # Funções de validação
├── App.tsx               # Componente principal
└── main.tsx              # Ponto de entrada
```

## Implementação Detalhada

### 1. Contexto de Autenticação (contexts/AuthContext.tsx)

```tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getStoredUser, storeUser, clearStoredUser } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário armazenado
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    storeUser(userData);
  };

  const logout ```tsx
  const logout = () => {
    setUser(null);
    clearStoredUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Hook de Autenticação (hooks/useAuth.ts)

```tsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

### 3. Serviço de API (services/api.ts)

```tsx
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;
```

### 4. Serviço de OTP (services/otp.ts)

```tsx
import api from './api';
import { OtpResponse, VerificationResponse } from '../types';

export const generateOtp = async (userId: string, channel: 'whatsapp' | 'email'): Promise<OtpResponse> => {
  try {
    const response = await api.post('/generate-otp', { userId, channel });
    return response.data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (
  userId: string, 
  otp: string, 
  channel: 'whatsapp' | 'email'
): Promise<VerificationResponse> => {
  try {
    const response = await api.post('/verify-otp', { userId, otp, channel });
    
    // Se a verificação for bem-sucedida e houver um token, armazená-lo
    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
```

### 5. Componente de Entrada de OTP (components/AuthFlow/OtpInput.tsx)

```tsx
import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Inicializar refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);
  
  // Focar no primeiro input ao montar
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);
  
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir apenas dígitos
    if (!/^\d*$/.test(value)) return;
    
    // Atualizar o valor no estado
    const newOtp = [...otp];
    
    // Pegar apenas o último caractere se mais de um for colado
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // Se um valor foi inserido e não é o último input, focar no próximo
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Verificar se todos os campos estão preenchidos
    if (newOtp.every(v => v) && newOtp.length === length) {
      onComplete(newOtp.join(''));
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Se backspace for pressionado e o campo estiver vazio, focar no anterior
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Verificar se os dados colados são apenas dígitos
    if (!/^\d+$/.test(pastedData)) return;
    
    // Preencher os inputs com os dígitos colados
    const newOtp = [...otp];
    for (let i = 0; i < Math.min(length, pastedData.length); i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focar no próximo input vazio ou no último se todos estiverem preenchidos
    const nextEmptyIndex = newOtp.findIndex(v => !v);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
    
    // Verificar se todos os campos estão preenchidos
    if (newOtp.every(v => v) && newOtp.length === length) {
      onComplete(newOtp.join(''));
    }
  };
  
  return (
    <div className="flex justify-center space-x-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      ))}
    </div>
  );
};

export default OtpInput;
```

### 6. Página de Login (pages/Login.tsx)

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Mail } from 'lucide-react';
import { generateOtp } from '../services/otp';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !email) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    // Gerar um ID de usuário único se não existir
    const newUserId = userId || `user_${Date.now()}`;
    setUserId(newUserId);
    
    try {
      setIsLoading(true);
      setError('');
      
      // Gerar OTP para WhatsApp
      await generateOtp(newUserId, 'whatsapp');
      
      // Armazenar informações do usuário para a verificação
      const userData = {
        id: newUserId,
        phoneNumber,
        email,
        verified: {
          whatsapp: false,
          email: false
        }
      };
      
      // Armazenar temporariamente para o processo de verificação
      localStorage.setItem('temp_user', JSON.stringify(userData));
      
      // Redirecionar para a página de verificação
      navigate('/verify', { state: { userId: newUserId, channel: 'whatsapp' } });
    } catch (error) {
      console.error('Error generating OTP:', error);
      setError('Falha ao gerar código de verificação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full">
        <div className="p-6 bg-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Autenticação OTP</h2>
          <p className="mt-2">Insira seu número de telefone e email para receber um código de verificação</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de WhatsApp
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+55 (11) 99999-9999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Enviando...' : 'Enviar Código de Verificação'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

### 7. Página de Verificação (pages/Verify.tsx)

```tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import OtpInput from '../components/AuthFlow/OtpInput';
import { verifyOtp, generateOtp } from '../services/otp';
import { useAuth } from '../hooks/useAuth';

const Verify: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [userId, setUserId] = useState<string>('');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // Obter dados da navegação ou localStorage
  useEffect(() => {
    const state = location.state as { userId: string; channel: 'whatsapp' | 'email' } | null;
    
    if (state?.userId) {
      setUserId(state.userId);
      setChannel(state.channel);
    } else {
      // Tentar obter do localStorage
      const tempUser = localStorage.getItem('temp_user');
      if (tempUser) {
        const userData = JSON.parse(tempUser);
        setUserId(userData.id);
      } else {
        // Redirecionar para login se não houver dados
        navigate('/login');
      }
    }
  }, [location, navigate]);
  
  // Gerenciar countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleVerify = async (otp: string) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await verifyOtp(userId, otp, channel);
      
      if (response.success) {
        setSuccess(`Verificação ${channel === 'whatsapp' ? 'do WhatsApp' : 'do email'} concluída com sucesso!`);
        
        // Se totalmente verificado, fazer login
        if (response.fullyVerified) {
          // Obter dados do usuário do localStorage
          const tempUser = localStorage.getItem('temp_user');
          if (tempUser) {
            const userData = JSON.parse(tempUser);
            
            // Fazer login
            login({
              ...userData,
              verified: {
                whatsapp: true,
                email: true
              }
            });
            
            // Limpar dados temporários
            localStorage.removeItem('temp_user');
            
            // Redirecionar para dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          }
        } else {
          // Se não estiver totalmente verificado, verificar o outro canal
          const nextChannel = channel === 'whatsapp' ? 'email' : 'whatsapp';
          
          // Gerar OTP para o próximo canal
          await generateOtp(userId, nextChannel);
          
          // Atualizar canal atual
          setChannel(nextChannel);
          
          // Limpar sucesso após um tempo
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setError(error.response?.data?.error || 'Falha ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResend = async () => {
    if (!userId || countdown > 0) return;
    
    try {
      setIsResending(true);
      setError('');
      
      await generateOtp(userId, channel);
      
      setSuccess(`Novo código enviado para ${channel === 'whatsapp' ? 'o WhatsApp' : 'o email'}`);
      setCountdown(60); // 1 minuto de espera para reenvio
      
      // Limpar sucesso após um tempo
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      setError(error.response?.data?.error || 'Falha ao reenviar código. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full">
        <div className="p-6 bg-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Verificação de Código</h2>
          <p className="mt-2">
            {channel === 'whatsapp' 
              ? 'Digite o código enviado para o seu WhatsApp' 
              : 'Digite o código enviado para o seu email'}
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center bg-red-50 text-red-600 p-3 rounded-md text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="flex items-center bg-green-50 text-green-600 p-3 rounded-md text-sm">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Digite o código de verificação
            </label>
            
            <OtpInput onComplete={handleVerify} />
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="text-indigo-600 text-sm hover:text-indigo-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Reenviando...
                  </>
                ) : countdown > 0 ? (
                  `Reenviar código em ${countdown}s`
                ) : (
                  'Reenviar código'
                )}
              </button>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>
              Verificando: {channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
```

### 8. Página de Dashboard (pages/Dashboard.tsx)

```tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { CheckCircle, Smartphone, Mail, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="h-6 w-6 mr-2 text-indigo-600" />
            Informações do Usuário
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <Smartphone className="h-5 w-5 mr-2 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="font-medium">{user.phoneNumber}</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-sm text-green-600">Verificado</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-sm text-green-600">Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Autenticação Concluída</h2>
          <p className="text-gray-600">
            Você concluiu com sucesso a autenticação de dois fatores usando WhatsApp e email.
            Este é um exemplo de dashboard protegido que só pode ser acessado após a verificação.
          </p>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-800">Autenticação de Dois Fatores Ativa</h3>
                <p className="text-sm text-green-600">
                  Sua conta está protegida com autenticação de dois fatores via WhatsApp e email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
```

### 9. Componente Principal (App.tsx)

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Fluxo de Usuário

1. **Início**:
   - Usuário acessa a página inicial
   - Clica em "Entrar" ou "Cadastrar"

2. **Login/Cadastro**:
   - Usuário insere número de telefone e email
   - Sistema gera um OTP para WhatsApp
   - OTP é enviado via WhatsApp

3. **Verificação WhatsApp**:
   - Usuário recebe código no WhatsApp
   - Insere o código na página de verificação
   - Sistema verifica o código

4. **Verificação Email** (após WhatsApp verificado):
   - Sistema gera um OTP para email
   - OTP é enviado via email
   - Usuário insere o código na página de verificação
   - Sistema verifica o código

5. **Autenticação Completa**:
   - Ambos os canais são verificados
   - Sistema gera um token JWT
   - Usuário é redirecionado para o dashboard

## Considerações de Segurança

1. **Proteção de Rotas**:
   - Implementar proteção de rotas para páginas que requerem autenticação
   - Verificar token JWT em cada requisição

2. **Validação de Entrada**:
   - Validar formato de número de telefone e email
   - Limitar tentativas de verificação

3. **Armazenamento Seguro**:
   - Armazenar token JWT de forma segura
   - Não armazenar informações sensíveis no localStorage

4. **Expiração de Sessão**:
   - Implementar expiração de token
   - Fornecer opção de "lembrar-me"

## Melhorias Futuras

1. **Acessibilidade**:
   - Melhorar suporte a leitores de tela
   - Implementar navegação por teclado

2. **Internacionalização**:
   - Adicionar suporte a múltiplos idiomas
   - Adaptar formatos de telefone por região

3. **Temas**:
   - Implementar modo escuro
   - Permitir personalização de cores

4. **Recuperação de Conta**:
   - Adicionar fluxo de recuperação de conta
   - Implementar opções alternativas de verificação

5. **Análise e Métricas**:
   - Rastrear taxas de sucesso de verificação
   - Monitorar tempo médio de conclusão do fluxo