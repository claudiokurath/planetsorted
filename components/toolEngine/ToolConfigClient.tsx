'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ToolConfig, ToolCalculatorInput } from '@/lib/types/toolConfig'
import { executeToolCalculation } from '@/lib/toolsEngine'
import { FormRenderer, ResultsRenderer } from '@/components/toolEngine/Renderers'

interface ToolClientProps {
  config: ToolConfig
  isLoggedIn: boolean
  whatsappVerified: boolean
  onSave?: (result: any) => Promise<void>
}

/**
 * Generic tool client component
 * Works with any tool config to provide:
 * - Form rendering + input management
 * - Calculation execution
 * - Results display
 * - Error handling
 */
export function ToolConfigClient({
  config,
  isLoggedIn,
  whatsappVerified,
  onSave,
}: ToolClientProps) {
  const [inputValues, setInputValues] = useState<ToolCalculatorInput>(() => {
    const initial: ToolCalculatorInput = {}
    for (const field of config.inputs) {
      initial[field.name] = field.default
    }
    return initial
  })

  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Calculate whenever inputs change
  const calculateResult = useCallback(async () => {
    setIsCalculating(true)
    setError(null)

    try {
      const calcResult = await executeToolCalculation(
        config,
        inputValues,
        {
          slug: config.slug,
          userId: isLoggedIn ? 'authenticated' : undefined,
          timestamp: Date.now(),
        }
      )

      if (calcResult.success && calcResult.output) {
        setResult(calcResult.output)
      } else {
        setError(calcResult.error || 'Calculation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsCalculating(false)
    }
  }, [config, inputValues, isLoggedIn])

  // Auto-calculate on mount and when inputs change
  useMemo(() => {
    calculateResult()
  }, [calculateResult])

  // Handle input changes
  const handleInputChange = useCallback((name: string, value: string | number | boolean) => {
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [result, onSave])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="rounded-none border border-white/10 bg-black p-8 shadow-2xl backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-[#F5C518]">
          Independent app
        </p>
        <h1 className="mt-3 text-5xl font-normal leading-[1.1] sm:text-6xl md:text-6xl">
          {config.metadata.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">
          {config.metadata.fallback_description}
        </p>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Error alert */}
        {error && (
          <div className="rounded-none border border-red-500/50 bg-red-900/20 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <FormRenderer
          config={config}
          inputValues={inputValues}
          onInputChange={handleInputChange}
          disabled={isCalculating}
        />

        {/* Results */}
        {result && (
          <ResultsRenderer
            config={config}
            result={result}
            onSave={onSave ? handleSave : undefined}
            isSaving={isSaving}
          />
        )}

        {/* Loading state */}
        {isCalculating && (
          <div className="rounded-none border border-[#F5C518]/30 bg-[#F5C518]/10 p-6 text-center text-slate-200">
            Calculating...
          </div>
        )}
      </main>
    </div>
  )
}
