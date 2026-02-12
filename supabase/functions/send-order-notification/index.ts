import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/**
 * Supabase Edge Function: send-order-notification
 * Triggers on: orders table INSERT
 */

// Fix: Use globalThis to access Deno safely when Deno types are not available in the build environment
const RESEND_API_KEY = (globalThis as any).Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY secret')
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const payload = await req.json()
    // Supabase Webhooks provide the new data in the 'record' property
    const record = payload.record 

    if (!record) {
      throw new Error('No record found in payload')
    }

    const customerEmail = record.user_email || 'مجهول'
    const totalPrice = record.total_price_dzd || 0
    const orderId = record.id || 'N/A'
    
    // Replace with your actual frontend URL
    const adminLink = `https://gdlgxrjurypmgjrtacki.supabase.co/storage/v1/object/public/site/index.html#/admin`

    console.log(`Sending email for order ${orderId} to amineoulhaci11@gmail.com`)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Wassit DZ <onboarding@resend.dev>',
        to: ['amineoulhaci11@gmail.com'],
        subject: `🔔 طلب جديد: ${totalPrice.toLocaleString()} دج - ${customerEmail}`,
        html: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; padding: 30px; border-radius: 20px; max-width: 600px; margin: auto; background-color: #ffffff;">
            <h2 style="color: #4f46e5; font-size: 24px; margin-bottom: 20px;">وصلك طلب جديد! 🚀</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 15px; margin-bottom: 25px; border-right: 5px solid #4f46e5;">
              <p style="margin: 10px 0;"><strong>البريد الإلكتروني للزبون:</strong> <span style="color: #334155;">${customerEmail}</span></p>
              <p style="margin: 10px 0;"><strong>المبلغ الإجمالي:</strong> <span style="color: #059669; font-weight: bold; font-size: 18px;">${totalPrice.toLocaleString()} دج</span></p>
              <p style="margin: 10px 0;"><strong>معرف الطلب:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${orderId}</code></p>
            </div>
            <div style="text-align: center;">
              <a href="${adminLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                الدخول للوحة التحكم للمعالجة
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
              هذا بريد تلقائي من نظام Wassit DZ Logistics.
            </p>
          </div>
        `,
      }),
    })

    const responseData = await res.json()
    
    if (!res.ok) {
      console.error('Resend API Error:', responseData)
      throw new Error(responseData.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true, id: responseData.id }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    // Fix: Cast error to any to safely access message property in environment without explicit Deno types
    const err = error as any;
    console.error('Edge Function Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})