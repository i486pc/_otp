import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, Users, Shield, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const Statistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  
  // Dados de exemplo para o gráfico de verificações por canal
  const channelData = [
    { name: 'SMS', value: 1245, color: '#4f46e5' },
    { name: 'Email', value: 987, color: '#0ea5e9' },
    { name: 'WhatsApp', value: 1876, color: '#10b981' },
    { name: 'Voice', value: 432, color: '#f59e0b' },
    { name: 'TOTP', value: 765, color: '#8b5cf6' },
  ];
  
  // Dados de exemplo para o gráfico de verificações por dia
  const dailyVerificationData = [
    { name: 'Seg', success: 145, failure: 12 },
    { name: 'Ter', success: 132, failure: 8 },
    { name: 'Qua', success: 164, failure: 15 },
    { name: 'Qui', success: 187, failure: 11 },
    { name: 'Sex', success: 212, failure: 19 },
    { name: 'Sáb', success: 143, failure: 7 },
    { name: 'Dom', success: 118, failure: 5 },
  ];
  
  // Dados de exemplo para o gráfico de taxa de sucesso
  const successRateData = [
    { name: 'SMS', rate: 98.2 },
    { name: 'Email', rate: 96.5 },
    { name: 'WhatsApp', rate: 99.1 },
    { name: 'Voice', rate: 94.8 },
    { name: 'TOTP', rate: 99.7 },
  ];
  
  // Estatísticas gerais
  const stats = [
    { name: 'Total de Usuários', value: '12,543', icon: <Users className="h-6 w-6 text-indigo-600" /> },
    { name: 'Verificações Hoje', value: '1,287', icon: <Activity className="h-6 w-6 text-green-600" /> },
    { name: 'Taxa de Sucesso', value: '98.3%', icon: <CheckCircle className="h-6 w-6 text-emerald-600" /> },
    { name: 'Tentativas Falhas', value: '214', icon: <AlertCircle className="h-6 w-6 text-amber-600" /> },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Estatísticas do Sistema OTP</h1>
        
        {/* Filtros de tempo */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">Período:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'day' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'week' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'month' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
        
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-full">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de verificações por canal */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Verificações por Canal</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} verificações`, 'Quantidade']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Gráfico de verificações por dia */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Verificações por Dia</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyVerificationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success" name="Sucesso" fill="#10b981" />
                  <Bar dataKey="failure" name="Falha" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Gráfico de taxa de sucesso */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Taxa de Sucesso por Canal (%)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={successRateData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[90, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Sucesso']} />
                <Bar dataKey="rate" name="Taxa de Sucesso" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Tabela de eventos recentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Eventos Recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Canal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(Date.now() - index * 1000 * 60 * 15).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      user_{Math.floor(Math.random() * 1000)}@example.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {['SMS', 'Email', 'WhatsApp', 'Voice', 'TOTP'][Math.floor(Math.random() * 5)]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {['Geração OTP', 'Verificação OTP', 'Login', 'Registro'][Math.floor(Math.random() * 4)]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Math.random() > 0.2 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Sucesso
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Falha
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;