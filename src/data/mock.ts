import { Cap, Need } from '../types'

export const caps: Cap[] = [
  {
    id: 'c1',
    title: 'CAPS III Margarida',
    unitType: 'CAPS',
    address: 'Rua Itambe, 2939 - Vila Rica / Jardim Vitrine',
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
    contact: 'Contato nao informado',
    lat: -20.4560,
    lng: -54.6200,
    photo: '/capsvilaalmeida.jpeg'
  },
  {
    id: 'c3',
    title: 'CAPS III Afrodite Doris Contis',
    unitType: 'CAPS',
    address: 'Rua Sao Paulo, 70 - Bairro Sao Francisco',
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
    contact: 'Contato nao informado',
    lat: -20.5020,
    lng: -54.6350,
    photo: '/capsaerorancho.jpeg'
  },
  {
    id: 'c5',
    title: 'CAPS AD IV - Alcool e Drogas',
    unitType: 'CAPS',
    address: 'Rua Theotonio Rosa Pires, 19 - Jardim Sao Bento',
    contact: 'Contato nao informado',
    lat: -20.4500,
    lng: -54.6380,
    photo: '/capsdrafatima.jpg'
  },
  {
    id: 'c6',
    title: 'CAPS AD III - Marcia Zen',
    unitType: 'CAPS',
    address: 'Av. Manoel da Costa Lima, 3272 - Guanandi',
    contact: 'Contato nao informado',
    lat: -20.5025,
    lng: -54.6355,
    photo: '/capsmarciazen.jpg'
  },
  {
    id: 'r1',
    title: 'Residencia Terapeutica Moinho dos Ventos (Tipo II)',
    unitType: 'Residência Terapêutica',
    address: 'Bairro Sao Francisco - Rua Sao Paulo',
    capacity: 'Capacidade aproximada: ate 10 moradores',
    lat: -20.4650,
    lng: -54.6130
  },
]

export const needs: Need[] = [
  { id: 'n1', title: 'Cobertores', amount: 50 },
  { id: 'n2', title: 'Alimentos', amount: 200 }
]
