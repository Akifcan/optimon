Project: OptiMon Dashboard

Stack:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components

Pages:
- / → Dashboard
- /deposit → Deposit page (mock form)

Components:
- VaultCard → Shows vault balance, APY, risk score
- StrategyCard → Shows each strategy allocation, APY
- RebalanceAnimation → Shows funds moving between strategies
- Header + Footer → basic layout

Data:
- Start with mock JSON for vault + strategies:
  vault = {
    balance: 10000,
    apy: 12.5,
    riskScore: 8.7,
    strategies: [
      { name: "Lending", allocation: 40, apy: 8, risk: 7 },
      { name: "LP Pool", allocation: 30, apy: 14, risk: 9 },
      { name: "Staking", allocation: 30, apy: 11, risk: 8 }
    ]
  }

UI Requirements:
- Modern, clean dashboard vibe
- VaultCard on top, strategies below
- Allocation bars showing % visually
- APY + Risk score visible
- Deposit button triggers modal (shadcn/ui modal) with form

Extra:
- RebalanceAnimation fakes funds moving between strategy bars every 5-10 sec
- Color-coded risk: green=low, yellow=medium, red=high