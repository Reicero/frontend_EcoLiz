export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

export interface Equipment {
  id: string;
  model: string;
  serialNumber: string;
  status: 'Actif' | 'En réparation' | 'Hors service';
  warrantyMonthsLeft: number | null;
  purchaseDate: string;
}

export interface RepairTicket {
  id: string;
  equipmentId: string;
  subject: string;
  status: 'En attente' | 'En cours' | 'Résolu';
  createdAt: string;
}