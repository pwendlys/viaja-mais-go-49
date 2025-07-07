export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      corridas: {
        Row: {
          data_atualizacao: string
          data_criacao: string
          destino_endereco: string | null
          destino_latitude: number
          destino_longitude: number
          distancia: number | null
          id: string
          id_motorista: string | null
          id_usuario: string
          origem_endereco: string | null
          origem_latitude: number
          origem_longitude: number
          status: Database["public"]["Enums"]["ride_status"]
          tempo_estimado: number | null
          valor: number | null
        }
        Insert: {
          data_atualizacao?: string
          data_criacao?: string
          destino_endereco?: string | null
          destino_latitude: number
          destino_longitude: number
          distancia?: number | null
          id?: string
          id_motorista?: string | null
          id_usuario: string
          origem_endereco?: string | null
          origem_latitude: number
          origem_longitude: number
          status?: Database["public"]["Enums"]["ride_status"]
          tempo_estimado?: number | null
          valor?: number | null
        }
        Update: {
          data_atualizacao?: string
          data_criacao?: string
          destino_endereco?: string | null
          destino_latitude?: number
          destino_longitude?: number
          distancia?: number | null
          id?: string
          id_motorista?: string | null
          id_usuario?: string
          origem_endereco?: string | null
          origem_latitude?: number
          origem_longitude?: number
          status?: Database["public"]["Enums"]["ride_status"]
          tempo_estimado?: number | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "corridas_id_motorista_fkey"
            columns: ["id_motorista"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corridas_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      motoristas: {
        Row: {
          data_criacao: string
          documentos: Json | null
          email: string
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          senha: string
          status: Database["public"]["Enums"]["driver_status"]
          telefone: string | null
        }
        Insert: {
          data_criacao?: string
          documentos?: Json | null
          email: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          senha: string
          status?: Database["public"]["Enums"]["driver_status"]
          telefone?: string | null
        }
        Update: {
          data_criacao?: string
          documentos?: Json | null
          email?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          senha?: string
          status?: Database["public"]["Enums"]["driver_status"]
          telefone?: string | null
        }
        Relationships: []
      }
      taxas: {
        Row: {
          data_atualizacao: string
          id: string
          preco_por_km: number
          preco_por_minuto: number
          taxa_base: number
          taxa_dinamica: number
        }
        Insert: {
          data_atualizacao?: string
          id?: string
          preco_por_km?: number
          preco_por_minuto?: number
          taxa_base?: number
          taxa_dinamica?: number
        }
        Update: {
          data_atualizacao?: string
          id?: string
          preco_por_km?: number
          preco_por_minuto?: number
          taxa_base?: number
          taxa_dinamica?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          data_criacao: string
          email: string
          endereco: string | null
          id: string
          nome: string
          senha: string
          telefone: string | null
        }
        Insert: {
          data_criacao?: string
          email: string
          endereco?: string | null
          id?: string
          nome: string
          senha: string
          telefone?: string | null
        }
        Update: {
          data_criacao?: string
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          senha?: string
          telefone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      driver_status: "ativo" | "inativo"
      ride_status: "pendente" | "em_andamento" | "concluido" | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      driver_status: ["ativo", "inativo"],
      ride_status: ["pendente", "em_andamento", "concluido", "cancelado"],
    },
  },
} as const
