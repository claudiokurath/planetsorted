/**
 * Tool Configuration Engine
 * Runtime engine that:
 * 1. Parses ToolConfig
 * 2. Invokes calculator functions
 * 3. Formats output according to spec
 * 4. Handles logging/analytics
 */

import type { ToolConfig, ToolCalculatorInput, ToolCalculatorOutput } from '@/lib/types/toolConfig'
import { calculateAdhdTax } from '@/lib/adhdTaxCalculator'
import { calculateWeeklyWins } from '@/lib/weeklyWinsCalculator'

/**
 * Map of calculator engine implementations
 * Add new calculator functions here
 */
const CALCULATOR_ENGINES: Record<string, (input: ToolCalculatorInput) => ToolCalculatorOutput> = {
  adhdTaxCalculator: calculateAdhdTax,
  weeklyWinsCalculator: calculateWeeklyWins,
}

export interface CalculatorContext {
  slug: string
  userId?: string
  userAgent?: string
  timestamp: number
}

export interface CalculatorResult {
  success: boolean
  output?: ToolCalculatorOutput
  error?: string
  latency_ms: number
  context: CalculatorContext
}

/**
 * Execute a tool calculation
 * - Validates inputs against config schema
 * - Invokes appropriate calculator engine
 * - Measures latency
 * - Returns structured result
 */
export async function executeToolCalculation(
  config: ToolConfig,
  inputs: ToolCalculatorInput,
  context: CalculatorContext
): Promise<CalculatorResult> {
  const startTime = Date.now()

  try {
    // 1. Validate inputs against config
    validateInputs(config, inputs)

    // 2. Get calculator function
    const calculator = CALCULATOR_ENGINES[config.computation.engine]
    if (!calculator) {
      throw new Error(`Unknown calculator engine: ${config.computation.engine}`)
    }

    // 3. Execute calculation
    const output = calculator(inputs)

    // 4. Return result
    return {
      success: true,
      output,
      latency_ms: Date.now() - startTime,
      context,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      latency_ms: Date.now() - startTime,
      context,
    }
  }
}

/**
 * Validate inputs against config schema
 */
function validateInputs(config: ToolConfig, inputs: ToolCalculatorInput): void {
  const errors: string[] = []

  for (const field of config.inputs) {
    const value = inputs[field.name]

    // Check required
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} is required`)
      continue
    }

    // Skip validation if optional and empty
    if (!field.required && (value === undefined || value === null || value === '')) {
      continue
    }

    // Type validation
    if (field.type === 'number') {
      const num = Number(value)
      if (isNaN(num)) {
        errors.push(`${field.label} must be a number`)
        continue
      }
      if (field.min !== undefined && num < field.min) {
        errors.push(`${field.label} must be at least ${field.min}`)
      }
      if (field.max !== undefined && num > field.max) {
        errors.push(`${field.label} must be at most ${field.max}`)
      }
    }

    // Custom validation
    if (field.validate) {
      const result = field.validate(value)
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : `${field.label} is invalid`)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join('; ')}`)
  }
}

/**
 * Get value from result object by path
 * e.g., getValueByPath(result, "breakdown.lateFees")
 */
export function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((val, key) => val?.[key], obj)
}

/**
 * Format a value according to format spec
 */
export function formatValue(value: any, format?: string): string {
  if (value === null || value === undefined) return ''

  switch (format) {
    case 'currency':
      return `£${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    case 'percentage':
      return `${(Number(value) * 100).toFixed(1)}%`
    case 'integer':
      return String(Math.round(Number(value)))
    case 'date':
      return new Date(value).toLocaleDateString()
    default:
      return String(value)
  }
}

/**
 * Interpolate template strings with result data
 * e.g., "You waste £{yearlyTotal} per year" + result
 */
export function interpolateTemplate(template: string, data: any): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = getValueByPath(data, key)
    return value !== undefined && value !== null ? String(value) : ''
  })
}

/**
 * Register a new calculator engine
 * Use this to extend the framework with new calculator types
 */
export function registerCalculator(
  engine: string,
  calculator: (input: ToolCalculatorInput) => ToolCalculatorOutput
): void {
  if (CALCULATOR_ENGINES[engine]) {
    console.warn(`Calculator engine "${engine}" already registered, overwriting`)
  }
  CALCULATOR_ENGINES[engine] = calculator
}

/**
 * List all registered calculator engines
 */
export function listCalculators(): string[] {
  return Object.keys(CALCULATOR_ENGINES)
}
