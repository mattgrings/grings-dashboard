import { useState, forwardRef } from 'react'
import type { InputHTMLAttributes, ElementType } from 'react'

interface InputGlowProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ElementType
  rightElement?: React.ReactNode
}

const InputGlow = forwardRef<HTMLInputElement, InputGlowProps>(
  ({ label, icon: Icon, rightElement, className = '', ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm text-gray-400 font-medium">{label}</label>
        )}
        <div
          className={`relative transition-all duration-300 rounded-xl ${
            focused
              ? 'shadow-[0_0_0_2px_rgba(0,230,32,0.4),0_0_20px_rgba(0,230,32,0.15)]'
              : 'shadow-none'
          }`}
        >
          {Icon && (
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                focused ? 'text-[#00E620]' : 'text-gray-600'
              }`}
            >
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            className={`w-full bg-[#111111] border rounded-xl py-3.5 text-white
                        placeholder:text-gray-600 outline-none transition-all
                        ${Icon ? 'pl-10' : 'px-4'}
                        ${rightElement ? 'pr-10' : 'pr-4'}
                        ${focused ? 'border-[#00E620]' : 'border-white/10'}
                        ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    )
  }
)

InputGlow.displayName = 'InputGlow'

export default InputGlow
