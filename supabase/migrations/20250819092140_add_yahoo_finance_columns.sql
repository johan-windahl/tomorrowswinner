-- Add Yahoo Finance columns to equity_prices_eod table
ALTER TABLE public.equity_prices_eod 
ADD COLUMN IF NOT EXISTS previous_close numeric,
ADD COLUMN IF NOT EXISTS daily_change_percent numeric;
