// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, CheckCircle, Package, Save } from "lucide-react"

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [categoria, setCategoria] = useState("")
  const [cantidadTotal, setCantidadTotal] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [saved, setSaved] = useState(false)

  const categorias = [
    "Sillas",
    "Mesas",
    "Inflables",
    "Equipos",
    "Carpas",
    "Foto",
    "Otros"
  ]

  const getProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      alert("Producto no encontrado")
      router.push("/products")
      return
    }

    setName(data.name || "")
    setPrice(data.price?.toString() || "")
    setDescription(data.description || "")
    setCategoria(data.categoria || "")
    setCantidadTotal(data.cantidad_total?.toString() || "")
    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()
      if (!isMounted) return
      if (error) {
        alert("Producto no encontrado")
        router.push("/products")
        return
      }
      setName(data.name || "")
      setPrice(data.price?.toString() || "")
      setDescription(data.description || "")
      setCategoria(data.categoria || "")
      setCantidadTotal(data.cantidad_total?.toString() || "")
      setLoading(false)
    }
    if (id) fetch()
    return () => { isMounted = false }
  }, [id])

  const handleUpdate = async () => {
    if (!name.trim()) {
      alert("El nombre es obligatorio")
      return
    }

    if (!price || Number(price) <= 0) {
      alert("El precio debe ser mayor a 0")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        price: Number(price),
        description: description.trim() || null,
        categoria: categoria || null,
        cantidad_total: cantidadTotal ? Number(cantidadTotal) : null
      })
      .eq("id", id)

    setSaving(false)

    if (error) {
      console.error(error)
      alert("Error: " + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Error al eliminar: " + error.message)
    } else {
      router.push("/products")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando producto...</p>
        </div>
      </div>
    )
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
            <span className="text-sm">Editar Producto</span>
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Producto actualizado correctamente</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-xl font-bold text-slate-900">{name || 'Editar Producto'}</h1>
            <p className="text-sm text-slate-500 mt-1">Actualiza los detalles del producto</p>
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
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowDelete(true)}
              className="px-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition"
            >
              Eliminar Producto
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Eliminar Producto</h3>
                  <p className="text-sm text-red-500">Esta acción no se puede deshacer</p>
                </div>
              </div>
              
              <p className="text-slate-600 mb-6">
                ¿Estás seguro de que deseas eliminar <strong className="text-slate-900">{name}</strong>? 
                Esta acción eliminará el producto de forma permanente.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Los cambios en el precio no afectarán cotizaciones o facturas ya creadas.
          </p>
        </div>
      </div>
    </div>
  )
}