// @ts-nocheck
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const imgPath = path.join(process.cwd(), 'public', 'aniversary.png')
    const buffer = fs.readFileSync(imgPath)
    const base64 = buffer.toString('base64')
    return NextResponse.json({ img: base64 })
  } catch (error) {
    return NextResponse.json({ error: 'Image not found' }, { status: 500 })
  }
}
