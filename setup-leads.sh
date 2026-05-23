#!/bin/bash
# ─── GEORANK LEADS SETUP SCRIPT ───────────────────────────────────────────────
# Run this after setting up Supabase and Resend accounts
# Usage: bash setup-leads.sh

set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GEOrank Leads Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Installing Supabase CLI..."
  npm install -g supabase
fi

# 2. Login to Supabase
echo "→ Logging in to Supabase..."
supabase login

# 3. Link to your project
echo ""
echo "→ Enter your Supabase project reference ID"
echo "  (Found in: supabase.com → your project → Settings → General)"
read -p "  Project ref: " PROJECT_REF
supabase link --project-ref "$PROJECT_REF"

# 4. Deploy the Edge Function
echo ""
echo "→ Deploying submit-lead Edge Function..."
supabase functions deploy submit-lead

# 5. Set secrets
echo ""
echo "→ Setting Edge Function secrets..."
echo "  You'll need:"
echo "  1. RESEND_API_KEY  — from resend.com → API Keys"
echo "  2. SUPABASE_SERVICE_ROLE_KEY — from Supabase → Settings → API → service_role"
echo ""
read -p "  RESEND_API_KEY: " RESEND_KEY
read -p "  SUPABASE_SERVICE_ROLE_KEY: " SERVICE_KEY

supabase secrets set RESEND_API_KEY="$RESEND_KEY"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_KEY"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ Edge Function deployed!"
echo ""
echo "  Your function URL:"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/submit-lead"
echo ""
echo "  Next: Update SUPABASE_URL in index.html"
echo "  Search for: YOUR_PROJECT_REF"
echo "  Replace with: $PROJECT_REF"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
