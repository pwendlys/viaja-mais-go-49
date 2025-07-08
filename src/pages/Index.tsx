
import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Heart, MapPin, Users, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-viaja-blue/10 to-viaja-green/10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-viaja rounded-full flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-viaja bg-clip-text text-transparent">
                Viaja+
              </h1>
              <p className="text-sm text-gray-600">Transporte Saúde Municipal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Juiz de Fora - MG</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Bem-vindo ao Viaja+
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Transporte gratuito e seguro para consultas médicas e exames de saúde
          </p>
          
          {/* Authentication Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/login">
              <Button size="lg" className="gradient-viaja text-white px-8 py-3 w-full sm:w-auto">
                Fazer Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="px-8 py-3 w-full sm:w-auto border-viaja-blue text-viaja-blue hover:bg-viaja-blue hover:text-white">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="h-12 w-12 bg-viaja-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-viaja-blue" />
              </div>
              <CardTitle className="text-viaja-blue">Gratuito</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Transporte 100% gratuito para consultas médicas, exames e tratamentos de saúde.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-12 w-12 bg-viaja-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-viaja-green" />
              </div>
              <CardTitle className="text-viaja-green">Seguro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Motoristas qualificados e veículos seguros para seu transporte com total segurança.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-12 w-12 bg-viaja-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-viaja-orange" />
              </div>
              <CardTitle className="text-viaja-orange">Pontual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Agendamento fácil e motoristas pontuais para não atrasar suas consultas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Como Funciona
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-viaja rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Cadastre-se</h4>
              <p className="text-gray-600">
                Crie sua conta como paciente ou motorista no sistema.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-viaja rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Solicite</h4>
              <p className="text-gray-600">
                Agende seu transporte informando origem, destino e horário.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-viaja rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Viaje</h4>
              <p className="text-gray-600">
                Motorista chega no horário e te leva com segurança ao destino.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Serviço oferecido pela Prefeitura Municipal de Juiz de Fora
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Para dúvidas e suporte, entre em contato: (32) 3690-7000
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
