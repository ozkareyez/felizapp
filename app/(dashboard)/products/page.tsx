// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Package, Plus, ChevronDown, ChevronUp, Pencil } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function ProductsPage() {
  const { t } = useI18n()
  const [products, setProducts] = useState([])
  const [expandedCategory, setExpandedCategory] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("categoria", { ascending: true })
      if (isMounted) setProducts(data || [])
    }
    fetch()
    return () => { isMounted = false }
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "AWG" }).format(amount || 0)
  }

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const cat = product.categoria || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {})

  const categories = Object.keys(productsByCategory).sort()

  const getCategoryColor = (cat) => {
    const colors = {
      Sillas: "bg-amber-100 text-amber-700",
      Mesas: "bg-blue-100 text-blue-700",
      Inflables: "bg-purple-100 text-purple-700",
      Equipos: "bg-green-100 text-green-700",
      Carpas: "bg-orange-100 text-orange-700",
      Foto: "bg-pink-100 text-pink-700",
      Otros: "bg-slate-100 text-slate-700"
    }
    return colors[cat] || "bg-slate-100 text-slate-700"
  }

  const getCategoryLabel = (cat) => {
    const labels = {
      Sillas: t("products.chairs"),
      Mesas: t("products.tables"),
      Inflables: t("products.inflatables"),
      Equipos: t("products.equipment"),
      Carpas: t("products.tents"),
      Foto: t("products.photo"),
      Otros: t("products.other"),
      Chairs: t("products.chairs"),
      Tables: t("products.tables"),
      Inflatables: t("products.inflatables"),
      Equipment: t("products.equipment"),
      Tents: t("products.tents"),
      Photo: t("products.photo"),
      Other: t("products.other")
    }
    return labels[cat] || cat
  }

  const toggleCategory = (cat) => {
    setExpandedCategory(expandedCategory === cat ? null : cat)
  }

  return (
    <div className="p-2 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("products.title")}</h1>
          <p className="text-slate-500 mt-1">{t("products.subtitle")}</p>
        </div>
        <Link 
          href="/products/create"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
        >
          <Plus className="w-5 h-5" />
          {t("products.newProduct")}
        </Link>
      </div>

      {/* Category Cards */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-slate-600">{getCategoryLabel(cat).charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">{getCategoryLabel(cat)}</h3>
                    <p className="text-sm text-slate-500">{productsByCategory[cat].length} items</p>
                  </div>
                </div>
                {expandedCategory === cat ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedCategory === cat && (
                <div className="border-t border-slate-100">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                    {productsByCategory[cat].map((product) => (
                      <div key={product.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-900">{product.name}</h4>
                          <Link 
                            href={`/products/${product.id}/edit`}
                            className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(cat)}`}>
                          {product.cantidad_total || 0} disponibles
                        </span>
                        {product.description && (
                          <p className="text-sm text-slate-500 mb-2 line-clamp-2">{product.description}</p>
                        )}
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(product.precio_dia || product.price)}
                          <span className="text-sm font-normal text-slate-500"> /día</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("products.noProducts")}</h3>
          <p className="text-slate-500 mb-4">{t("products.addProduct")}</p>
          <Link href="/products/create" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">
            {t("products.newProduct")} →
          </Link>
        </div>
      )}
    </div>
  )
}