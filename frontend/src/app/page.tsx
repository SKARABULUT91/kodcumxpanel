"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    status: "loading",
    engine: "SNR ENGINE V2",
    active_sessions: 0
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await api.getStatus();
      setStats(data);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // 10 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Sistem Durumu Kartı */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">MOTOR DURUMU</h3>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xl font-bold uppercase">{stats.status}</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">Sistem: {stats.engine}</p>
        </div>

        {/* Operasyon Merkezi Kartı */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">HAYALET OPERASYONLARI</h3>
          <span className="text-3xl font-bold">AKTİF</span>
          <p className="text-xs text-gray-500 mt-4">2 Saniye Kuralı: Devrede</p>
        </div>

        {/* Aktif Oturumlar */}
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">AKTİF OTURUMLAR</h3>
          <span className="text-3xl font-bold">{stats.active_sessions || 0}</span>
          <p className="text-xs text-gray-500 mt-4">@kullanici_adi bazlı oturumlar</p>
        </div>
      </div>
    </DashboardLayout>
  );
}