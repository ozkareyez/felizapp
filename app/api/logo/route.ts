import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logof.png')
    const logoBuffer = fs.readFileSync(logoPath)
    const base64 = logoBuffer.toString('base64')
    return NextResponse.json({ logo: base64 })
  } catch (error) {
    return NextResponse.json({ error: 'Logo not found' }, { status: 500 })
  }
}