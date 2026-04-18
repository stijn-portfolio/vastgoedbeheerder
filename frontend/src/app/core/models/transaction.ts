// src/app/core/models/transaction.model.ts
export interface Transaction {
    id: number;
    vastgoedId: number;
    datum: string;
    bedrag: number;
    type: 'INKOMST' | 'UITGAVE';
    omschrijving: string;
    categorie: string;
  }