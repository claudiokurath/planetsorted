/**
 * Tool Configuration Schema
 * Defines the complete structure for a configuration-driven tool
 */

export type FieldType = 'number' | 'text' | 'slider' | 'toggle' | 'select'
export type CalculatorEngine = 'adhdTaxCalculator' | 'customFunction'
export type OutputFormat = 'currency' | 'percentage' | 'integer' | 'text' | 'date'
export type Category = 'Mind' | 'Wealth' | 'Body' | 'Tech' | 'Connection' | 'Impression' | 'Growth'

export interface ToolInputField {
  name: string
  label: string
  type: FieldType
  default: string | number | boolean
  placeholder?: string
  help?: string
  
  // For number/slider fields
  min?: number
  max?: number
  step?: number
  
  // For select fields
  options?: Array<{ value: string | number; label: string }>
  
  // Validation
  required?: boolean
  validate?: (value: any) => boolean | string
}

export interface OutputHeadline {
  label: string  // e.g., "Estimated annual leak"
  value_path: string  // e.g., "yearlyTotal" (path in result object)
  format?: OutputFormat
}

export interface OutputSection {
  title?: string
  type: 'breakdown' | 'action_list' | 'categorized_list' | 'text'
  data: string  // Path to data in result (e.g., "breakdown", "actionPlan")
  format?: OutputFormat
}

export interface OutputConfig {
  headline?: OutputHeadline
  subheading?: {
    label: string  // Template with {keyName} placeholders
  }
  sections: OutputSection[]
}

export interface ComputationConfig {
  engine: CalculatorEngine
  type: 'calculator' | 'generator'
}

export interface ToolMetadata {
  title: string
  seo_title?: string
  meta_description?: string
  fallback_description: string
  cover_image?: string
  category: Category
  read_time?: string  // e.g., "3 min"
  excerpt?: string
}

export interface ToolConfig {
  slug: string
  metadata: ToolMetadata
  inputs: ToolInputField[]
  computation: ComputationConfig
  output: OutputConfig
  
  // Access control
  requiresAuth?: boolean
  requiresWhatsAppVerification?: boolean
  
  // Persistence
  saveable?: boolean  // Can users save results?
  historySaved?: boolean  // Do we track history?
}

export interface ToolCalculatorInput {
  [key: string]: string | number | boolean
}

export interface ToolCalculatorOutput {
  [key: string]: any
}

export type ToolCalculatorFunction = (input: ToolCalculatorInput) => ToolCalculatorOutput
