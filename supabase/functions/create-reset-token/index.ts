import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateTokenRequest {
  email: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email }: CreateTokenRequest = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar token aleatorio de 6 dígitos
    const token = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Expiración: 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    // Conectar a Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Limpiar tokens viejos del mismo email
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email)
      .or('expires_at.lt.now(),used.eq.true')

    // Insertar nuevo token
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email,
        token,
        expires_at: expiresAt,
        used: false,
      })

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create reset token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar email con Brevo
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')
    const brevoSenderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
    const brevoSenderName = Deno.env.get('BREVO_SENDER_NAME')

    console.log('Brevo config check:', { 
      hasApiKey: !!brevoApiKey, 
      hasSenderEmail: !!brevoSenderEmail,
      hasSenderName: !!brevoSenderName 
    })

    if (!brevoApiKey || !brevoSenderEmail) {
      console.error('Missing Brevo configuration')
      return new Response(
        JSON.stringify({ error: 'Missing Brevo configuration', hasApiKey: !!brevoApiKey, hasSenderEmail: !!brevoSenderEmail }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailHtml = `
      <h2>Recuperación de contraseña</h2>
      <p>Hola,</p>
      <p>Has solicitado recuperar tu contraseña en Ofertas Ocaña.</p>
      <p>Tu código de recuperación es: <strong>${token}</strong></p>
      <p>Este código expira en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
      <p>Saludos,<br>El equipo de Ofertas Ocaña</p>
    `

    console.log('Enviando email a Brevo:', { email, token })

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          email: brevoSenderEmail,
          name: brevoSenderName || 'Ofertas Ocaña',
        },
        to: [{ email }],
        subject: 'Código de recuperación - Ofertas Ocaña',
        htmlContent: emailHtml,
      }),
    })

    console.log('Respuesta de Brevo:', { status: response.status, ok: response.ok })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error de Brevo:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Email enviado exitosamente')

    return new Response(
      JSON.stringify({ success: true, token }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
