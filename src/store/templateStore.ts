import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'
import type { TemplateTreino } from '../data/templatesTreino'

export interface PastaTemplate {
  id: string
  nome: string
  cor: string
  criadoEm: string
}

export interface TemplateComPasta extends TemplateTreino {
  pastaId: string | null
  criadoEm: string
}

interface TemplateState {
  pastas: PastaTemplate[]
  templates: TemplateComPasta[]

  // Pastas
  addPasta: (nome: string, cor?: string) => void
  updatePasta: (id: string, data: Partial<PastaTemplate>) => void
  deletePasta: (id: string) => void

  // Templates
  addTemplate: (template: Omit<TemplateComPasta, 'id' | 'criadoEm'>) => void
  updateTemplate: (id: string, data: Partial<TemplateComPasta>) => void
  deleteTemplate: (id: string) => void
  duplicateTemplate: (id: string) => void
  getTemplatesByPasta: (pastaId: string | null) => TemplateComPasta[]
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      pastas: [],
      templates: [],

      addPasta: (nome, cor) => {
        set((s) => ({
          pastas: [
            ...s.pastas,
            {
              id: crypto.randomUUID(),
              nome,
              cor: cor ?? '#00E620',
              criadoEm: new Date().toISOString(),
            },
          ],
        }))
      },

      updatePasta: (id, data) => {
        set((s) => ({
          pastas: s.pastas.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }))
      },

      deletePasta: (id) => {
        set((s) => ({
          pastas: s.pastas.filter((p) => p.id !== id),
          templates: s.templates.map((t) =>
            t.pastaId === id ? { ...t, pastaId: null } : t
          ),
        }))
      },

      addTemplate: (template) => {
        set((s) => ({
          templates: [
            ...s.templates,
            {
              ...template,
              id: crypto.randomUUID(),
              criadoEm: new Date().toISOString(),
            },
          ],
        }))
      },

      updateTemplate: (id, data) => {
        set((s) => ({
          templates: s.templates.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }))
      },

      deleteTemplate: (id) => {
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
      },

      duplicateTemplate: (id) => {
        const original = get().templates.find((t) => t.id === id)
        if (!original) return
        set((s) => ({
          templates: [
            ...s.templates,
            {
              ...original,
              id: crypto.randomUUID(),
              nome: `${original.nome} — Cópia`,
              criadoEm: new Date().toISOString(),
            },
          ],
        }))
      },

      getTemplatesByPasta: (pastaId) =>
        get().templates.filter((t) => t.pastaId === pastaId),
    }),
    {
      name: 'grings-templates',
      storage: createJSONStorage(() => jsonStorage),
    }
  )
)
