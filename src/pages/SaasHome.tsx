import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, Mail, Phone, MessageSquare, CheckCircle, Lock, Users, Zap, Globe } from 'lucide-react';

const SaasHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Autenticação Segura Multi-Canal
              </h1>
              <p className="text-xl mb-8 text-indigo-100">
                Proteja suas contas e aplicações com nossa plataforma de autenticação OTP avançada. Suporte para SMS, Email, WhatsApp, Chamadas de Voz e Aplicativos Autenticadores.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register" 
                  className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Começar Gratuitamente
                </Link>
                <Link 
                  to="/demo" 
                  className="px-6 py-3 bg-indigo-700 text-white font-medium rounded-lg hover:bg-indigo-800 transition-colors"
                >
                  Ver Demonstração
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex justify-center mb-6">
                      <Shield className="h-16 w-16 text-indigo-600" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                        <Smartphone className="h-5 w-5 text-indigo-600 mr-3" />
                        <span>Verificação via SMS</span>
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      </div>
                      <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                        <Mail className="h-5 w-5 text-indigo-600 mr-3" />
                        <span>Verificação via Email</span>
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      </div>
                      <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-indigo-600 mr-3" />
                        <span>Verificação via WhatsApp</span>
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      </div>
                      <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                        <Phone className="h-5 w-5 text-indigo-600 mr-3" />
                        <span>Verificação via Chamada</span>
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Recursos Avançados de Autenticação
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma oferece uma solução completa para autenticação multi-fator, com suporte para diversos canais e recursos avançados de segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Fator Avançado</h3>
              <p className="text-gray-600">
                Combine múltiplos canais de verificação para uma segurança reforçada. Exija verificação em pelo menos dois canais diferentes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Integração Simples</h3>
              <p className="text-gray-600">
                API RESTful fácil de integrar com qualquer aplicação. SDKs disponíveis para várias linguagens e frameworks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cobertura Global</h3>
              <p className="text-gray-600">
                Envie SMS e faça chamadas para mais de 200 países. Suporte a múltiplos idiomas e formatos de número de telefone.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Segurança Avançada</h3>
              <p className="text-gray-600">
                Proteção contra ataques de força bruta, limitação de taxa, expiração de códigos e criptografia de ponta a ponta.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gerenciamento de Usuários</h3>
              <p className="text-gray-600">
                Painel de administração completo para gerenciar usuários, visualizar histórico de autenticação e configurar políticas de segurança.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Conformidade e Auditoria</h3>
              <p className="text-gray-600">
                Conformidade com GDPR, LGPD e outras regulamentações. Logs detalhados de auditoria para todas as operações de autenticação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Planos Simples e Transparentes
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano que melhor atende às necessidades da sua empresa. Todos os planos incluem acesso a todos os canais de autenticação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                <p className="text-gray-500 mt-1">Para pequenas empresas</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">R$99</span>
                  <span className="ml-1 text-xl text-gray-500">/mês</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Até 1.000 autenticações/mês</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Todos os canais de autenticação</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>API e SDKs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <button className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
                  Começar Agora
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-indigo-600 transform scale-105">
              <div className="p-6 border-b bg-indigo-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">POPULAR</span>
                </div>
                <p className="text-gray-500">Para empresas em crescimento</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">R$249</span>
                  <span className="ml-1 text-xl text-gray-500">/mês</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Até 10.000 autenticações/mês</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Todos os canais de autenticação</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>API, SDKs e Webhooks</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Painel de administração</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <button className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
                  Começar Agora
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                <p className="text-gray-500 mt-1">Para grandes organizações</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">R$999</span>
                  <span className="ml-1 text-xl text-gray-500">/mês</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Autenticações ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Todos os canais de autenticação</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>API, SDKs, Webhooks e SSO</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Painel de administração avançado</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte 24/7 com SLA</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Implantação dedicada</span>
                  </li>
                </ul>
                <button className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
                  Fale com Vendas
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Empresas de todos os tamanhos confiam em nossa plataforma para proteger suas aplicações e usuários.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">T</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold">TechCorp</h4>
                  <p className="text-gray-500">Empresa de Software</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Implementamos a autenticação multi-canal em nosso aplicativo e vimos uma redução de 95% nas tentativas de fraude. A integração foi simples e o suporte técnico excelente."
              </p>
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">F</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold">FinanceSecure</h4>
                  <p className="text-gray-500">Instituição Financeira</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Como instituição financeira, a segurança é nossa prioridade. A plataforma de OTP multi-canal nos permitiu atender aos requisitos regulatórios e melhorar a experiência do cliente."
              </p>
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">H</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold">HealthPlus</h4>
                  <p className="text-gray-500">Plataforma de Saúde</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Lidamos com dados sensíveis de saúde e precisávamos de uma solução de autenticação robusta. A flexibilidade de canais e a facilidade de uso para nossos pacientes foram determinantes na escolha."
              </p>
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Pronto para proteger seus usuários?
          </h2>
          <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
            Comece a usar nossa plataforma de autenticação multi-canal hoje mesmo. Configuração simples, integração rápida e resultados imediatos.
          </p>
          <div className="mt-8 flex justify-center">
            <Link 
              to="/register" 
              className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Criar Conta Gratuita
            </Link>
            <Link 
              to="/contact" 
              className="ml-4 px-8 py-3 bg-indigo-700 text-white font-medium rounded-lg hover:bg-indigo-800 transition-colors"
            >
              Falar com Especialista
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-indigo-400 mr-2" />
                <span className="text-xl font-bold">OTPSecure</span>
              </div>
              <p className="mt-4 text-gray-400">
                Plataforma de autenticação multi-canal para empresas de todos os tamanhos.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-400 hover:text-white">Recursos</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Preços</Link></li>
                <li><Link to="/demo" className="text-gray-400 hover:text-white">Demonstração</Link></li>
                <li><Link to="/docs" className="text-gray-400 hover:text-white">Documentação</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">Sobre Nós</Link></li>
                <li><Link to="/customers" className="text-gray-400 hover:text-white">Clientes</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white">Carreiras</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contato</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-white">Central de Ajuda</Link></li>
                <li><Link to="/status" className="text-gray-400 hover:text-white">Status do Sistema</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 OTPSecure. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SaasHome;