'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TreasuryAsset } from '../hooks/use-treasury-data';

interface AssetAllocationChartProps {
  assets: TreasuryAsset[];
}

export default function AssetAllocationChart({
  assets,
}: AssetAllocationChartProps) {
  // Map assets to chart data format
  const chartData = React.useMemo(() => {
    if (!assets || assets.length === 0) return [];

    return assets.map(asset => ({
      asset: asset.id,
      value: asset.allocation,
      usdValue: asset.value,
      fill: asset.colorVar,
      name: asset.name,
      description: asset.description,
      verificationLink: asset.verificationLink,
    }));
  }, [assets]);

  // Create Chart Config dynamically based on assets
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      allocation: {
        label: 'Allocation',
      },
    };
    if (assets && assets.length > 0) {
      assets.forEach((asset, index) => {
        config[asset.id] = {
          label: asset.name,
          color: `var(--chart-${index + 1})`,
        };
      });
    }
    return config;
  }, [assets]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2 text-xl font-bold lg:text-2xl">
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[500px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-auto min-w-[200px]"
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            backgroundColor: item.payload.fill || item.color,
                          } as React.CSSProperties
                        }
                      />
                      <div className="flex flex-1 items-center justify-between leading-none">
                        <span className="text-muted-foreground mr-2">
                          {name}
                        </span>
                        <div className="text-foreground font-mono font-medium tabular-nums">
                          {formatCurrency(item.payload.usdValue)}
                          <span className="text-muted-foreground/70 ml-1 font-normal">
                            ({value}%)
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="asset"
              innerRadius={90}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-5xl font-bold"
                        >
                          100%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 32}
                          className="fill-muted-foreground text-xl"
                        >
                          Backed
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="asset" />}
              className="-translate-y-2 flex-col gap-4 align-middle text-base *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
