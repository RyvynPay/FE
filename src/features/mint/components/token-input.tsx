'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface TokenInputProps {
  label: string;
  value: string;
  balance?: string;
  tokenSymbol: 'USDC' | 'ryUSD';
  onChange?: (value: string) => void;
  onMaxClick?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function TokenInput({
  label,
  value,
  balance,
  tokenSymbol,
  onChange,
  onMaxClick,
  disabled = false,
  readOnly = false,
}: TokenInputProps) {
  const isUSDC = tokenSymbol === 'USDC';

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-muted-foreground text-sm">{label}</Label>
        {balance && (
          <div className="text-muted-foreground text-sm">
            Balance:{' '}
            <span className="text-foreground">
              {balance} {tokenSymbol}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type={readOnly ? 'text' : 'number'}
          value={value}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          placeholder="0.00"
          readOnly={readOnly}
          disabled={disabled}
          className="placeholder:text-muted-foreground min-w-0 flex-1 [appearance:textfield] bg-transparent text-3xl outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <div className="flex items-center gap-2">
          {onMaxClick && !readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMaxClick}
              className="h-8"
              disabled={disabled}
            >
              MAX
            </Button>
          )}

          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            {isUSDC ? (
              <>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  U
                </div>
                <span className="font-medium">USDC</span>
              </>
            ) : (
              <>
                <div className="text-background bg-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  R
                </div>
                <span className="font-medium">ryUSD</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
