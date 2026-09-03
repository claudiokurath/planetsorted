'use client'

import type { ToolConfig, ToolCalculatorInput, ToolCalculatorOutput } from '@/lib/types/toolConfig'
import { formatValue, interpolateTemplate, getValueByPath } from '@/lib/toolsEngine'

interface FormRendererProps {
  config: ToolConfig
  inputValues: ToolCalculatorInput
  onInputChange: (name: string, value: string | number | boolean) => void
  disabled?: boolean
}

/**
 * Generic form renderer for any tool config
 * Renders all input fields based on their type
 */
export function FormRenderer({
  config,
  inputValues,
  onInputChange,
  disabled = false,
}: FormRendererProps) {
  return (
    <section className="rounded-none border border-white/10 bg-black p-6 shadow-2xl">
      <h2 className="text-2xl font-medium">Your inputs</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {config.inputs.map((field) => {
          const value = inputValues[field.name] ?? field.default
          const isRequired = field.required ?? false
          const helpText = field.help || ''

          return (
            <div key={field.name} className="flex flex-col gap-2">
              <label htmlFor={field.name} className="flex items-center gap-2 text-sm font-medium text-slate-200">
                {field.label}
                {isRequired && <span className="text-red-400">*</span>}
              </label>

              {/* Number input */}
              {field.type === 'number' && (
                <input
                  id={field.name}
                  type="number"
                  value={value}
                  onChange={(e) => onInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder ?? '0'}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  disabled={disabled}
                  className="rounded-none border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#F5C518] disabled:opacity-50"
                />
              )}

              {/* Text input */}
              {field.type === 'text' && (
                <textarea
                  id={field.name}
                  value={value}
                  onChange={(e) => onInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  disabled={disabled}
                  className="rounded-none border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#F5C518] disabled:opacity-50"
                />
              )}

              {/* Slider input */}
              {field.type === 'slider' && (
                <div className="flex items-center gap-4">
                  <input
                    id={field.name}
                    type="range"
                    value={value}
                    onChange={(e) => onInputChange(field.name, e.target.value)}
                    min={field.min ?? 0}
                    max={field.max ?? 100}
                    step={field.step ?? 1}
                    disabled={disabled}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-white">{value}</span>
                </div>
              )}

              {/* Toggle/checkbox input */}
              {field.type === 'toggle' && (
                <label className="flex items-center gap-2">
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={value === true || value === 'true'}
                    onChange={(e) => onInputChange(field.name, e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-white/10 bg-black"
                  />
                  <span className="text-sm text-slate-300">{field.label}</span>
                </label>
              )}

              {/* Select input */}
              {field.type === 'select' && field.options && (
                <select
                  id={field.name}
                  value={value}
                  onChange={(e) => onInputChange(field.name, e.target.value)}
                  disabled={disabled}
                  className="rounded-none border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#F5C518] disabled:opacity-50"
                >
                  <option value="">Select an option...</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Help text */}
              {helpText && <p className="text-xs text-slate-400">{helpText}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

interface ResultsRendererProps {
  config: ToolConfig
  result: ToolCalculatorOutput
  onSave?: () => void | Promise<void>
  isSaving?: boolean
}

/**
 * Generic results renderer for any tool config
 * Renders output headline, sections, and results
 */
export function ResultsRenderer({
  config,
  result,
  onSave,
  isSaving = false,
}: ResultsRendererProps) {
  return (
    <section className="rounded-none border border-[#F5C518]/30 bg-[#F5C518]/10 p-6 shadow-2xl">
      {/* Headline */}
      {config.output.headline && (
        <>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#F5C518]">
            {config.output.headline.label}
          </p>
          <div className="mt-3 text-5xl font-normal sm:text-6xl">
            {formatValue(
              getValueByPath(result, config.output.headline.value_path),
              config.output.headline.format
            )}
          </div>
        </>
      )}

      {/* Subheading */}
      {config.output.subheading && (
        <p className="mt-2 text-slate-200">
          {interpolateTemplate(config.output.subheading.label, result)}
        </p>
      )}

      {/* Output sections */}
      <div className="mt-6 space-y-6">
        {config.output.sections.map((section, idx) => (
          <div key={idx}>
            {section.title && <h3 className="mb-3 text-lg font-medium">{section.title}</h3>}

            {/* Breakdown section (key-value pairs) */}
            {section.type === 'breakdown' && (
              <BreakdownSection data={getValueByPath(result, section.data)} format={section.format} />
            )}

            {/* Action list section (bullet list) */}
            {section.type === 'action_list' && (
              <ActionListSection data={getValueByPath(result, section.data)} />
            )}

            {/* Categorized list section (card list) */}
            {section.type === 'categorized_list' && (
              <CategorizedListSection data={getValueByPath(result, section.data)} />
            )}

            {/* Text section (plain text) */}
            {section.type === 'text' && (
              <p className="text-slate-200">{getValueByPath(result, section.data)}</p>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      {onSave && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="mt-6 w-full rounded-none border border-white/10 bg-black px-4 py-3 font-medium text-[#F5C518] transition hover:border-[#F5C518] disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Result'}
        </button>
      )}
    </section>
  )
}

/**
 * Render breakdown section (key-value pairs)
 */
function BreakdownSection({
  data,
  format,
}: {
  data: Record<string, any> | undefined
  format?: string
}) {
  if (!data) return null

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between rounded-none border border-white/10 bg-black px-4 py-3 text-sm">
          <span className="text-slate-300">{humanizeKey(key)}</span>
          <span className="font-medium text-white">{formatValue(value, format)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Render action list section (bullet list)
 */
function ActionListSection({ data }: { data: string[] | undefined }) {
  if (!data || !Array.isArray(data)) return null

  return (
    <ul className="space-y-2">
      {data.map((step, idx) => (
        <li key={idx} className="flex gap-3">
          <span className="mt-0.5 text-[#F5C518]">•</span>
          <span className="text-sm text-slate-300">{step}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Render categorized list section (card list)
 */
function CategorizedListSection({ data }: { data: string[] | undefined }) {
  if (!data || !Array.isArray(data)) return null

  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="rounded-none border border-white/10 bg-black p-3 text-xs text-slate-200">
          {item}
        </div>
      ))}
    </div>
  )
}

/**
 * Convert camelCase/snake_case to "Human Readable"
 */
function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim()
}
