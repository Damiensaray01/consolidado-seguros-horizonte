'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Asegurado } from '@/types';
import { Header } from '@/components/Header';
import { RecurrenceMatrix } from '@/components/RecurrenceMatrix';
import { ReceiptModal } from '@/components/ReceiptModal';

export default function Home() {
  const [asegurados, setAsegurados] = useState<Asegurado[]>([]);
  const [selectedAsegurado, setSelectedAsegurado] = useState<Asegurado | null>(null);

  useEffect(() => {
    // Escuchar la colección principal en Firestore: consolidado_pagos
    const unsubscribe = onSnapshot(collection(db, 'consolidado_pagos'), (snapshot) => {
      const data: Asegurado[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAsegurados(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        <RecurrenceMatrix 
          asegurados={asegurados} 
          onSelectAsegurado={(item) => setSelectedAsegurado(item)} 
        />
      </div>

      <ReceiptModal 
        asegurado={selectedAsegurado} 
        onClose={() => setSelectedAsegurado(null)} 
      />
    </main>
  );
}