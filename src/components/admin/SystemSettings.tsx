
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Database, Bell, Shield, MapPin, FileText, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  is_active: boolean;
  updated_at: string;
}

const SystemSettings = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);

  // Estados para as diferentes categorias de configurações
  const [generalSettings, setGeneralSettings] = useState({
    app_name: 'Viaja Mais GO',
    app_version: '1.0.0',
    maintenance_mode: false,
    max_distance_km: '50',
    max_wait_time_minutes: '15',
    support_phone: '(32) 3333-4444',
    support_email: 'suporte@viajamais.com'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enable_sms: true,
    enable_push: true,
    enable_email: true,
    notification_sound: true,
    auto_assign_radius_km: '10'
  });

  const [securitySettings, setSecuritySettings] = useState({
    require_document_verification: true,
    session_timeout_minutes: '60',
    max_login_attempts: '5',
    enable_two_factor: false,
    password_min_length: '8'
  });

  const [mapSettings, setMapSettings] = useState({
    default_zoom: '13',
    map_style: 'streets',
    enable_traffic: true,
    route_optimization: true,
    geofence_radius_meters: '100'
  });

  useEffect(() => {
    fetchSystemConfigs();
  }, []);

  const fetchSystemConfigs = async () => {
    try {
      setIsLoading(true);
      
      // Como não temos uma tabela de configurações ainda, vamos usar valores padrão
      // Em uma implementação real, você faria:
      // const { data, error } = await supabase.from('system_configs').select('*');
      
      // Por agora, simulamos a busca
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfigs([]);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (category: string, settings: any) => {
    try {
      setSaving(true);
      
      // Simular salvamento no banco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Configurações de ${category} salvas com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
      return;
    }

    try {
      setSaving(true);
      
      // Restaurar valores padrão
      setGeneralSettings({
        app_name: 'Viaja Mais GO',
        app_version: '1.0.0',
        maintenance_mode: false,
        max_distance_km: '50',
        max_wait_time_minutes: '15',
        support_phone: '(32) 3333-4444',
        support_email: 'suporte@viajamais.com'
      });

      setNotificationSettings({
        enable_sms: true,
        enable_push: true,
        enable_email: true,
        notification_sound: true,
        auto_assign_radius_km: '10'
      });

      setSecuritySettings({
        require_document_verification: true,
        session_timeout_minutes: '60',
        max_login_attempts: '5',
        enable_two_factor: false,
        password_min_length: '8'
      });

      setMapSettings({
        default_zoom: '13',
        map_style: 'streets',
        enable_traffic: true,
        route_optimization: true,
        geofence_radius_meters: '100'
      });

      toast.success('Configurações restauradas para os valores padrão');
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error);
      toast.error('Erro ao restaurar configurações');
    } finally {
      setSaving(false);
    }
  };

  const performBackup = async () => {
    try {
      setSaving(true);
      
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupData = {
        timestamp: new Date().toISOString(),
        general: generalSettings,
        notifications: notificationSettings,
        security: securitySettings,
        maps: mapSettings
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_configuracoes_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Backup das configurações criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <div className="flex gap-2">
          <Button onClick={performBackup} variant="outline" disabled={isSaving}>
            <Database className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button onClick={resetToDefaults} variant="outline" disabled={isSaving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="maps" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Mapas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="app_name">Nome do Aplicativo</Label>
                  <Input
                    id="app_name"
                    value={generalSettings.app_name}
                    onChange={(e) => setGeneralSettings({...generalSettings, app_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="app_version">Versão</Label>
                  <Input
                    id="app_version"
                    value={generalSettings.app_version}
                    onChange={(e) => setGeneralSettings({...generalSettings, app_version: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="max_distance">Distância Máxima (km)</Label>
                  <Input
                    id="max_distance"
                    type="number"
                    value={generalSettings.max_distance_km}
                    onChange={(e) => setGeneralSettings({...generalSettings, max_distance_km: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="max_wait_time">Tempo Máximo de Espera (minutos)</Label>
                  <Input
                    id="max_wait_time"
                    type="number"
                    value={generalSettings.max_wait_time_minutes}
                    onChange={(e) => setGeneralSettings({...generalSettings, max_wait_time_minutes: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="support_phone">Telefone de Suporte</Label>
                  <Input
                    id="support_phone"
                    value={generalSettings.support_phone}
                    onChange={(e) => setGeneralSettings({...generalSettings, support_phone: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="support_email">Email de Suporte</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) => setGeneralSettings({...generalSettings, support_email: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={generalSettings.maintenance_mode}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenance_mode: checked})}
                />
                <Label htmlFor="maintenance_mode">Modo de Manutenção</Label>
              </div>

              <Button onClick={() => saveSettings('gerais', generalSettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_sms"
                    checked={notificationSettings.enable_sms}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, enable_sms: checked})}
                  />
                  <Label htmlFor="enable_sms">Habilitar SMS</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_push"
                    checked={notificationSettings.enable_push}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, enable_push: checked})}
                  />
                  <Label htmlFor="enable_push">Habilitar Push Notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_email"
                    checked={notificationSettings.enable_email}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, enable_email: checked})}
                  />
                  <Label htmlFor="enable_email">Habilitar Email</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="notification_sound"
                    checked={notificationSettings.notification_sound}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notification_sound: checked})}
                  />
                  <Label htmlFor="notification_sound">Som de Notificação</Label>
                </div>

                <div>
                  <Label htmlFor="auto_assign_radius">Raio de Atribuição Automática (km)</Label>
                  <Input
                    id="auto_assign_radius"
                    type="number"
                    value={notificationSettings.auto_assign_radius_km}
                    onChange={(e) => setNotificationSettings({...notificationSettings, auto_assign_radius_km: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings('notificações', notificationSettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de Notificações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require_verification"
                    checked={securitySettings.require_document_verification}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, require_document_verification: checked})}
                  />
                  <Label htmlFor="require_verification">Exigir Verificação de Documentos</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_2fa"
                    checked={securitySettings.enable_two_factor}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enable_two_factor: checked})}
                  />
                  <Label htmlFor="enable_2fa">Habilitar Autenticação de Dois Fatores</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="session_timeout">Timeout de Sessão (minutos)</Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      value={securitySettings.session_timeout_minutes}
                      onChange={(e) => setSecuritySettings({...securitySettings, session_timeout_minutes: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_login_attempts">Máximo de Tentativas de Login</Label>
                    <Input
                      id="max_login_attempts"
                      type="number"
                      value={securitySettings.max_login_attempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password_min_length">Tamanho Mínimo da Senha</Label>
                    <Input
                      id="password_min_length"
                      type="number"
                      value={securitySettings.password_min_length}
                      onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => saveSettings('segurança', securitySettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Mapas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default_zoom">Zoom Padrão</Label>
                  <Input
                    id="default_zoom"
                    type="number"
                    value={mapSettings.default_zoom}
                    onChange={(e) => setMapSettings({...mapSettings, default_zoom: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="map_style">Estilo do Mapa</Label>
                  <Select
                    value={mapSettings.map_style}
                    onValueChange={(value) => setMapSettings({...mapSettings, map_style: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streets">Streets</SelectItem>
                      <SelectItem value="satellite">Satélite</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="geofence_radius">Raio de Geofence (metros)</Label>
                  <Input
                    id="geofence_radius"
                    type="number"
                    value={mapSettings.geofence_radius_meters}
                    onChange={(e) => setMapSettings({...mapSettings, geofence_radius_meters: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_traffic"
                    checked={mapSettings.enable_traffic}
                    onCheckedChange={(checked) => setMapSettings({...mapSettings, enable_traffic: checked})}
                  />
                  <Label htmlFor="enable_traffic">Habilitar Informações de Trânsito</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="route_optimization"
                    checked={mapSettings.route_optimization}
                    onCheckedChange={(checked) => setMapSettings({...mapSettings, route_optimization: checked})}
                  />
                  <Label htmlFor="route_optimization">Otimização de Rotas</Label>
                </div>
              </div>

              <Button onClick={() => saveSettings('mapas', mapSettings)} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de Mapas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
