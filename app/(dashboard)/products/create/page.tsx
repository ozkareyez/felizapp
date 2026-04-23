// @ts-nocheck
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Package } from "lucide-react"

export default function CreateProductPage() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [categoria, setCategoria] = useState("")
  const [cantidadTotal, setCantidadTotal] = useState("")
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)
  const router = useRouter()

  const categorias = [
    "Sillas",
    "Mesas",
    "Inflables",
    "Equipos",
    "Carpas",
    "Foto",
    "Otros"
  ]

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("El nombre es obligatorio")
      return
    }

    if (!price || Number(price) <= 0) {
      alert("El precio debe ser mayor a 0")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("products")
      .insert([{
        name: name.trim(),
        price: Number(price),
        description: description.trim() || null,
        categoria: categoria || null,
        cantidad_total: cantidadTotal ? Number(cantidadTotal) : null,
        company_id: "2b58cc88-82a4-444b-86d3-e5b952320d5a"
      }])

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Error: " + error.message)
    } else {
      setCreated(true)
      setTimeout(() => router.push("/products"), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/products" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-2 text-slate-500">
            <Package className="w-5 h-5" />
            <span className="text-sm">Nuevo Producto</span>
          </div>
        </div>

        {/* Success Message */}
        {created && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-emerald-700 font-medium">Producto creado correctamente</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-xl font-bold text-slate-900">Crear Nuevo Producto</h1>
            <p className="text-sm text-slate-500 mt-1">Agrega un nuevo producto a tu inventario</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                placeholder="Ej: Silla Tiffany Blanca"
              />
            </div>

            {/* Category & Quantity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Categoría</label>
                <div className="relative">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white pr-10"
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Cantidad en Inventario</label>
                <input
                  type="number"
                  value={cantidadTotal}
                  onChange={(e) => setCantidadTotal(e.target.value)}
                  min="0"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Precio por Día (AWG) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">AWG</div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full border border-slate-200 rounded-xl pl-16 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white resize-none"
                placeholder="Descripción opcional del producto..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Crear Producto</span>
                </>
              )}
            </button>
            
            <Link
              href="/products"
              className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 text-center transition"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}