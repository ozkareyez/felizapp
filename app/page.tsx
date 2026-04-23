// @ts-nocheck
"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25">
          <span className="text-white font-bold text-3xl">FE</span>
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-3">FELIZ ENTERPRISE</h1>
        <p className="text-xl text-slate-400 mb-8">Sistema de facturación profesional</p>
        
        <div className="space-y-3">
          <Link 
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-xl hover:shadow-blue-600/25"
          >
            Entrar al Dashboard →
          </Link>
          
          <div className="flex gap-3">
            <Link 
              href="/login"
              className="flex-1 bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all backdrop-blur"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-medium hover:bg-slate-100 transition-all"
            >
              Registrarse
            </Link>
          </div>
        </div>
        
        <p className="text-slate-500 text-sm mt-8">
          Gestiona tus facturas, clientes y productos de forma sencilla
        </p>
      </div>
    </div>
  )
}