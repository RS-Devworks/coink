'use client'

import { forwardRef, useState, useImperativeHandle, ChangeEvent, KeyboardEvent } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value?: number
  onChange?: (value: number) => void
  onValueChange?: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  name?: string
  id?: string
}

export interface CurrencyInputRef {
  focus: () => void
  blur: () => void
  getValue: () => number
  setValue: (value: number) => void
}

const CurrencyInput = forwardRef<CurrencyInputRef, CurrencyInputProps>(
  ({ value = 0, onChange, onValueChange, placeholder = "R$ 0,00", disabled, className, name, id }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => formatCurrency(value))
    const [rawValue, setRawValue] = useState(value)
    
    // Referência para o input interno
    const inputRef = useState<HTMLInputElement | null>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      getValue: () => rawValue,
      setValue: (newValue: number) => {
        setRawValue(newValue)
        setDisplayValue(formatCurrency(newValue))
      }
    }))

    // Formatar valor para exibição (R$ 1.234,56)
    function formatCurrency(value: number): string {
      if (value === 0) return ''
      
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    // Converter string para centavos
    function parseCurrency(value: string): number {
      // Remove tudo exceto números
      const numbersOnly = value.replace(/\D/g, '')
      
      if (!numbersOnly) return 0
      
      // Converte centavos para reais (divide por 100)
      return parseInt(numbersOnly) / 100
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Se o campo está sendo limpo
      if (inputValue === '') {
        setDisplayValue('')
        setRawValue(0)
        onChange?.(0)
        onValueChange?.(0)
        return
      }

      // Parse do valor
      const newValue = parseCurrency(inputValue)
      
      // Limitar a valores razoáveis (até R$ 999.999.999,99)
      if (newValue > 999999999.99) {
        return
      }

      setRawValue(newValue)
      setDisplayValue(formatCurrency(newValue))
      onChange?.(newValue)
      onValueChange?.(newValue)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Permitir teclas de controle
      const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
      
      if (controlKeys.includes(e.key)) {
        return
      }

      // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      if (e.ctrlKey || e.metaKey) {
        return
      }

      // Permitir apenas números
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault()
      }
    }

    const handleFocus = () => {
      // Quando foca, se o valor é 0, limpa o campo
      if (rawValue === 0) {
        setDisplayValue('')
      }
    }

    const handleBlur = () => {
      // Quando perde o foco, se está vazio, mostra 0
      if (displayValue === '') {
        setDisplayValue('')
      }
    }

    return (
      <Input
        ref={(el) => {
          inputRef.current = el
        }}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "text-right font-mono",
          className
        )}
        name={name}
        id={id}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export default CurrencyInput