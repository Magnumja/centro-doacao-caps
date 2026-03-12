import { Cap, Need } from '../types'

export const caps: Cap[] = [
  {
    id: 'c1',
    title: 'CAPS III Margarida',
    unitType: 'CAPS',
    address: 'Rua Itambe, 2939 - Vila Rica / Jardim Vitrine',
    contact: '(67) 3314-3144'
  },
  {
    id: 'c2',
    title: 'CAPS III Vila Almeida',
    unitType: 'CAPS',
    address: 'Rua Marechal Hermes, 854 - Vila Almeida',
    contact: 'Contato nao informado'
  },
  {
    id: 'c3',
    title: 'CAPS III Afrodite Doris Contis',
    unitType: 'CAPS',
    address: 'Rua Sao Paulo, 70 - Bairro Sao Francisco',
    contact: '(67) 3314-3185 / 3314-3188'
  },
  {
    id: 'c4',
    title: 'CAPS III Aero Rancho',
    unitType: 'CAPS',
    address: 'Av. Manoel da Costa Lima, 3272 - Guanandi',
    contact: 'Contato nao informado'
  },
  {
    id: 'c5',
    title: 'CAPS AD IV - Alcool e Drogas',
    unitType: 'CAPS',
    address: 'Rua Theotonio Rosa Pires, 19 - Jardim Sao Bento',
    contact: 'Contato nao informado'
  },
  {
    id: 'c6',
    title: 'CAPS AD III - Marcia Zen',
    unitType: 'CAPS',
    address: 'Av. Manoel da Costa Lima, 3272 - Guanandi',
    contact: 'Contato nao informado'
  },
  {
    id: 'c7',
    title: 'CAPSi (Infanto-Juvenil)',
    unitType: 'CAPS',
    address: 'Rua Sao Paulo, 70 - Bairro Sao Francisco',
    contact: '(67) 3314-3874 / 3314-3952'
  },
  {
    id: 'r1',
    title: 'Residencia Terapeutica Moinho dos Ventos (Tipo II)',
    unitType: 'Residência Terapêutica',
    address: 'Bairro Sao Francisco - Rua Sao Paulo',
    capacity: 'Capacidade aproximada: ate 10 moradores'
  },
  {
    id: 'r2',
    title: 'Residencia Terapeutica I - Campo Grande',
    unitType: 'Residência Terapêutica',
    address: 'Endereco publico nao divulgado oficialmente',
    description: 'Moradia assistida para usuarios da rede de saude mental',
    privacyNote: 'Endereco completo preservado por protecao e privacidade dos moradores.'
  },
  {
    id: 'r3',
    title: 'Residencia Terapeutica II - Campo Grande',
    unitType: 'Residência Terapêutica',
    address: 'Endereco publico nao divulgado oficialmente',
    privacyNote: 'Endereco completo preservado por protecao e privacidade dos moradores.'
  },
  {
    id: 'r4',
    title: 'Residencia Terapeutica III - Campo Grande',
    unitType: 'Residência Terapêutica',
    address: 'Endereco publico nao divulgado oficialmente',
    privacyNote: 'Endereco completo preservado por protecao e privacidade dos moradores.'
  }
]

export const needs: Need[] = [
  { id: 'n1', title: 'Cobertores', amount: 50 },
  { id: 'n2', title: 'Alimentos', amount: 200 }
]
