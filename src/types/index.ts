// Representa uma unidade da rede (CAPS ou Residência Terapêutica).
export type Cap = {
  // Identificador único da unidade (ex.: c1, r1).
  id: string
  // Nome exibido para usuários e gestores.
  title: string
  // Tipo da unidade para diferenciação visual e regras.
  unitType: 'CAPS' | 'Residência Terapêutica'
  // Endereço principal da unidade.
  address: string
  // Telefone ou canal de contato (opcional).
  contact?: string
  // Texto livre com descrição adicional da unidade.
  description?: string
  // Capacidade de atendimento/moradia quando aplicável.
  capacity?: string
  // Avisos de privacidade e cuidado com dados sensíveis.
  privacyNote?: string
  // Coordenadas geográficas para renderização no mapa.
  lat?: number
  lng?: number
  // Caminho da imagem da unidade para cards e destaque.
  photo?: string
}

// Necessidade publicada por uma unidade para captação de doações.
export type Need = {
  id: string
  title: string
  // Quantidade necessária do item.
  amount: number
  description: string
  // Relacionamento com a unidade solicitante.
  unitId: string
  unitName: string
  // Categoria textual da necessidade (ex.: higiene, oficinas, etc.).
  category: string
  // Nível de prioridade usado no destaque de telas públicas.
  priority: 'alta' | 'media'
}

// Tipo genérico para usuários simples (não utilizado no fluxo admin atual).
export type User = {
  id: string
  name: string
  email?: string
}

// Gestor/host responsável por uma unidade no painel administrativo.
export type Host = {
  id: string
  name: string
  email: string
  password: string // Em produção, seria hashed
  capId: string // Qual CAPS ele gerencia
  contact: string
  // Perfil de autorização para permissões futuras.
  role: 'host' | 'admin'
}

// Registro de doação (intenção ou entrada) associado a uma unidade.
export type Donation = {
  id: string
  capId: string
  // Categoria padronizada para filtros e analytics.
  category: 'roupa' | 'comida' | 'utensilios'
  // Quantidade informada pelo doador.
  quantity: string
  // Dados do doador podem ser omitidos em doação anônima.
  donorName?: string
  donorEmail?: string
  isAnonymous: boolean
  // Data e hora agendadas/informadas para entrega.
  date: string
  time: string
  // Data/hora de criação do registro no sistema.
  registeredAt: string // timestamp
}

// Dados de residente para visão de controle social.
export type Resident = {
  id: string
  name: string
  capId: string // Qual CAPS ele reside
  capName: string
  emergencyContact: string
  entryDate: string
  // Situação atual do residente no acompanhamento.
  status?: 'ativo' | 'egresso'
}

// Nota: este arquivo contém apenas tipos compartilhados.
