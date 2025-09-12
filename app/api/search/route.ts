import { NextRequest, NextResponse } from 'next/server'
import { dbAdmin } from '../../../lib/firebase-admin'

type Verse = { ref: string; text: string }

function normalizePashto(input: string) {
  return input
    .normalize('NFC')
    .replace(/[\u200C\u200D\u200E\u200F]/g, '')
    .replace(/[يىئ]/g, 'ی')
}

export async function POST(req: NextRequest) {
  try {
    if (!dbAdmin) return NextResponse.json({ results: [], coverage: [], error: 'firebase-admin missing' }, { status: 500 })
    const body = await req.json().catch(() => ({})) as { query?: string; scope?: 'all' | 'ot' | 'nt' }
    const q = (body.query || '').trim()
    const scope = body.scope || 'all'
    if (!q) return NextResponse.json({ results: [], coverage: [] })

    const norm = normalizePashto(q)
    const results: Verse[] = []
    const coverage = new Map<string, number>()

    // Try direct text match first on `verses` collection (simple contains)
    // Note: Firestore does not support contains on strings. Expect a `tokens` array.
    const token = norm.toLowerCase()
    const versesCol = dbAdmin.collection(process.env.FIREBASE_VERSES_COLLECTION || 'verses')
    const tokenQuery = await versesCol.where('tokens', 'array-contains', token).limit(50).get()
    if (!tokenQuery.empty) {
      for (const d of tokenQuery.docs) {
        const v: any = d.data()
        if (scope !== 'all' && v.testament && v.testament !== scope.toUpperCase()) continue
        const text = v.text || v.pashto_text || v.pashto || ''
        const ref = `${v.book} ${v.chapter}:${v.verse}`
        results.push({ ref, text })
        coverage.set(v.book, (coverage.get(v.book) || 0) + 1)
      }
    }

    // Fallback: expand via mappings and occurrences
    if (results.length === 0) {
      // 1) root
      let root = norm
      const mapCol = dbAdmin.collection('form_to_root_map')
      const m1 = await mapCol.where('form', '==', norm).limit(1).get()
      if (!m1.empty && m1.docs[0]?.data()?.root) root = String(m1.docs[0].data().root)

      // 2) forms via mapping or inflections
      const forms = new Set<string>()
      const m2 = await mapCol.where('root', '==', root).limit(1000).get()
      for (const d of m2.docs) { const f = (d.data() as any).form; if (f) forms.add(String(f)) }
      if (forms.size === 0) {
        const inflCol = dbAdmin.collection('inflections')
        const infl = await inflCol.where('base_word', '==', root).limit(1000).get()
        for (const d of infl.docs) { const f = (d.data() as any).inflected_form; if (f) forms.add(String(f)) }
      }
      if (forms.size === 0) forms.add(norm)

      // 3) occurrences
      const occCol = dbAdmin.collection('form_occurrences')
      const occRefs = new Set<string>()
      const allForms = Array.from(forms)
      for (let i = 0; i < allForms.length; i += 10) {
        const batch = allForms.slice(i, i + 10)
        const qs = await occCol.where('pashto_form', 'in', batch).limit(1000).get()
        for (const d of qs.docs) { const r = (d.data() as any).verse_reference; if (r) occRefs.add(String(r)) }
      }

      // 4) resolve verses by exact ref
      const refs = Array.from(occRefs).slice(0, 100)
      for (const ref of refs) {
        const m = ref.match(/^(.+?)\s+(\d+):(\d+)$/)
        if (!m) continue
        const [_, book, ch, vs] = m
        const vr = await versesCol
          .where('book', '==', book)
          .where('chapter', '==', Number(ch))
          .where('verse', '==', Number(vs))
          .limit(1)
          .get()
        if (!vr.empty) {
          const v = vr.docs[0].data() as any
          if (scope !== 'all' && v.testament && v.testament !== scope.toUpperCase()) continue
          const text = v.text || v.pashto_text || v.pashto || ''
          results.push({ ref, text })
          coverage.set(book, (coverage.get(book) || 0) + 1)
        }
      }
    }

    const coverageArr = Array.from(coverage.entries()).map(([book, count]) => ({ book, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ results, coverage: coverageArr })
  } catch (e) {
    return NextResponse.json({ results: [], coverage: [], error: (e as any)?.message || 'error' }, { status: 500 })
  }
}
