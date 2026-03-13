import { Cap, Need, Host, Donation, Resident } from '../types'

export const caps: Cap[] = [
  {
    id: 'c1',
    title: 'CAPS III Margarida',
    unitType: 'CAPS',
    address: 'Rua Itambé, 2939 - Vila Rica / Jardim Vitrine',
    contact: '(67) 3314-3144',
    lat: -20.4810,
    lng: -54.6660,
    photo: '/capsmargarida.jpg'
  },
  {
    id: 'c2',
    title: 'CAPS III Vila Almeida',
    unitType: 'CAPS',
    address: 'Rua Marechal Hermes, 854 - Vila Almeida',
    contact: 'Contato não informado',
    lat: -20.4560,
    lng: -54.6200,
    photo: '/capsvilaalmeida.jpeg'
  },
  {
    id: 'c3',
    title: 'CAPS III Afrodite Doris Contis',
    unitType: 'CAPS',
    address: 'Rua São Paulo, 70 - Bairro São Francisco',
    contact: '(67) 3314-3185 / 3314-3188',
    lat: -20.4660,
    lng: -54.6135,
    photo: '/capsafrodite.jpeg'
  },
  {
    id: 'c4',
    title: 'CAPS III Aero Rancho',
    unitType: 'CAPS',
    address: 'Av. Manoel da Costa Lima, 3272 - Guanandi',
    contact: 'Contato não informado',
    lat: -20.5020,
    lng: -54.6350,
    photo: '/capsaerorancho.jpeg'
  },
  {
    id: 'c5',
    title: 'CAPS AD IV - Álcool e Drogas',
    unitType: 'CAPS',
    address: 'Rua Theotônio Rosa Pires, 19 - Jardim São Bento',
    contact: 'Contato não informado',
    lat: -20.4500,
    lng: -54.6380,
    photo: '/capsdrafatima.jpg'
  },
  {
    id: 'c6',
    title: 'CAPS AD III - Márcia Zen',
    unitType: 'CAPS',
    address: 'Av. Manoel da Costa Lima, 3272 - Guanandi',
    contact: 'Contato não informado',
    lat: -20.5025,
    lng: -54.6355,
    photo: '/capsmarciazen.jpg'
  },
  {
    id: 'r1',
    title: 'Residência Terapêutica Moinho dos Ventos (Tipo II)',
    unitType: 'Residência Terapêutica',
    address: 'Bairro São Francisco - Rua São Paulo',
    capacity: 'Capacidade aproximada: até 10 moradores',
    lat: -20.4650,
    lng: -54.6130
  },
]

export const needs: Need[] = [
  {
    id: 'n1',
    title: 'Cobertores',
    amount: 50,
    description: 'Reposição imediata para acolhimentos noturnos e salas de repouso.',
    unitId: 'c1',
    unitName: 'CAPS III Margarida',
    category: 'Acolhimento',
    priority: 'alta'
  },
  {
    id: 'n2',
    title: 'Alimentos não perecíveis',
    amount: 120,
    description: 'Mantém lanches e refeições de usuários em atividades continuadas.',
    unitId: 'c3',
    unitName: 'CAPS III Afrodite Doris Contis',
    category: 'Segurança alimentar',
    priority: 'alta'
  },
  {
    id: 'n3',
    title: 'Kits de higiene',
    amount: 80,
    description: 'Atende acolhimentos prolongados e situações de maior vulnerabilidade.',
    unitId: 'c4',
    unitName: 'CAPS III Aero Rancho',
    category: 'Cuidado diário',
    priority: 'alta'
  },
  {
    id: 'n4',
    title: 'Materiais para oficinas',
    amount: 35,
    description: 'Suporta atividades terapêuticas em grupos e oficinas de reinserção social.',
    unitId: 'c2',
    unitName: 'CAPS III Vila Almeida',
    category: 'Oficinas terapêuticas',
    priority: 'media'
  },
  {
    id: 'n5',
    title: 'Produtos de limpeza',
    amount: 60,
    description: 'Reforça a manutenção dos espaços coletivos e das residências de apoio.',
    unitId: 'r1',
    unitName: 'Residência Terapêutica Moinho dos Ventos',
    category: 'Ambiente e cuidado',
    priority: 'alta'
  },
  {
    id: 'n6',
    title: 'Toalhas de banho',
    amount: 24,
    description: 'Apoia acolhimentos em rotinas de higiene e permanência mais extensa.',
    unitId: 'c5',
    unitName: 'CAPS AD IV - Álcool e Drogas',
    category: 'Apoio cotidiano',
    priority: 'media'
  }
]

export const hosts: Host[] = [
  {
    id: 'host1',
    name: 'Teste',
    email: 'teste@caps.br',
    password: 'senha123',
    capId: 'c1',
    contact: '(67) 99999-0001',
    role: 'host'
  }
]

export const donations: Donation[] = [
  {
    id: 'd1',
    capId: 'c1',
    category: 'roupa',
    quantity: '20 peças',
    donorName: 'João Silva',
    donorEmail: 'joao@email.com',
    isAnonymous: false,
    date: '2026-03-10',
    time: '14:30',
    registeredAt: '2026-03-10T14:35:00'
  },
  {
    id: 'd2',
    capId: 'c1',
    category: 'comida',
    quantity: '50 kg',
    donorEmail: undefined,
    donorName: undefined,
    isAnonymous: true,
    date: '2026-03-09',
    time: '10:00',
    registeredAt: '2026-03-09T10:05:00'
  },
  {
    id: 'd3',
    capId: 'c1',
    category: 'utensilios',
    quantity: '15 unidades',
    donorName: 'Maria Oliveira',
    donorEmail: 'maria@email.com',
    isAnonymous: false,
    date: '2026-03-08',
    time: '16:00',
    registeredAt: '2026-03-08T16:10:00'
  },
  {
    id: 'd4',
    capId: 'c1',
    category: 'roupa',
    quantity: '30 peças',
    isAnonymous: true,
    donorName: undefined,
    donorEmail: undefined,
    date: '2026-03-07',
    time: '11:30',
    registeredAt: '2026-03-07T11:35:00'
  },
  {
    id: 'd5',
    capId: 'c1',
    category: 'comida',
    quantity: '100 kg',
    donorName: 'Empresa ABC Alimentos',
    donorEmail: 'contato@abcalimentos.com',
    isAnonymous: false,
    date: '2026-03-06',
    time: '09:00',
    registeredAt: '2026-03-06T09:10:00'
  },
  {
    id: 'd6',
    capId: 'c2',
    category: 'roupa',
    quantity: '25 peças',
    isAnonymous: true,
    donorName: undefined,
    donorEmail: undefined,
    date: '2026-03-09',
    time: '13:00',
    registeredAt: '2026-03-09T13:05:00'
  },
  {
    id: 'd7',
    capId: 'c2',
    category: 'utensilios',
    quantity: '10 unidades',
    donorName: 'Pedro Costa',
    donorEmail: 'pedro@email.com',
    isAnonymous: false,
    date: '2026-03-05',
    time: '15:30',
    registeredAt: '2026-03-05T15:35:00'
  },
  {
    id: 'd8',
    capId: 'c3',
    category: 'comida',
    quantity: '80 kg',
    isAnonymous: true,
    donorName: undefined,
    donorEmail: undefined,
    date: '2026-03-10',
    time: '12:00',
    registeredAt: '2026-03-10T12:05:00'
  }
]

export const residents: Resident[] = [
  {
    id: 'res1',
    name: 'Luís Fernando Pereira',
    capId: 'c2',
    capName: 'CAPS III Vila Almeida',
    emergencyContact: '(67) 98888-1111',
    entryDate: '2025-06-15',
    status: 'ativo'
  },
  {
    id: 'res2',
    name: 'Paula Rocha',
    capId: 'c3',
    capName: 'CAPS III Afrodite Doris Contis',
    emergencyContact: '(67) 98888-2222',
    entryDate: '2025-08-20',
    status: 'ativo'
  },
  {
    id: 'res3',
    name: 'Marcelo Torres',
    capId: 'c4',
    capName: 'CAPS III Aero Rancho',
    emergencyContact: '(67) 98888-3333',
    entryDate: '2025-11-10',
    status: 'ativo'
  },
  {
    id: 'res4',
    name: 'Cristina Gomes',
    capId: 'c5',
    capName: 'CAPS AD IV - Álcool e Drogas',
    emergencyContact: '(67) 98888-4444',
    entryDate: '2025-09-05',
    status: 'ativo'
  },
  {
    id: 'res5',
    name: 'Felipe Miranda',
    capId: 'r1',
    capName: 'Residência Terapêutica Moinho dos Ventos',
    emergencyContact: '(67) 98888-5555',
    entryDate: '2025-07-22',
    status: 'ativo'
  },
  {
    id: 'res6',
    name: 'Beatriz Santos',
    capId: 'c1',
    capName: 'CAPS III Margarida',
    emergencyContact: '(67) 98888-6666',
    entryDate: '2025-10-02',
    status: 'ativo'
  },
  {
    id: 'res7',
    name: 'Rodrigo Alves',
    capId: 'c2',
    capName: 'CAPS III Vila Almeida',
    emergencyContact: '(67) 98888-7777',
    entryDate: '2025-12-01',
    status: 'ativo'
  },
  {
    id: 'res8',
    name: 'Vanessa Dias',
    capId: 'c3',
    capName: 'CAPS III Afrodite Doris Contis',
    emergencyContact: '(67) 98888-8888',
    entryDate: '2026-01-15',
    status: 'ativo'
  }
]
