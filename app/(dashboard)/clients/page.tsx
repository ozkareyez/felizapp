// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Mail, Phone, MapPin, Users, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function ClientsPage() {
  const { t } = useI18n()
  const [clients, setClients] = useState([])

  const getClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setClients(data || [])
    }
  }

  const deleteClient = async (id) => {
    if (!confirm(t("clients.deleteConfirm"))) return
    
    const { error } = await supabase.from("clients").delete().eq("id", id)
    if (error) {
      alert(t("clients.deleteError"))
    } else {
      getClients()
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false })
      if (isMounted) setClients(data || [])
    }
    fetch()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="p-2 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("clients.title")}</h1>
          <p className="text-slate-500 mt-1">{t("clients.subtitle")}</p>
        </div>
        <Link 
          href="/clients/create"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
        >
          <span className="text-lg">+</span>
          {t("clients.newClient")}
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client, i) => (
          <div 
            key={client.id} 
            className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <span className="text-violet-600 font-bold text-lg">
                  {(client.name || "C")[0].toUpperCase()}
                </span>
              </div>
              <button 
                onClick={() => deleteClient(client.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
              <h3 className="font-semibold text-slate-900 mb-1">{client.name}</h3>
            {client.email && <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Mail className="w-4 h-4" />{client.email}</p>}
            {client.phone && <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Phone className="w-4 h-4" />{client.phone}</p>}
            {client.address && <p className="text-sm text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" />{client.address}</p>}
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay clientes todavía</h3>
          <p className="text-slate-500 mb-4">Agrega tu primer cliente para comenzar</p>
          <Link href="/clients/create" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
            Agregar cliente →
          </Link>
        </div>
      )}
    </div>
  )
}