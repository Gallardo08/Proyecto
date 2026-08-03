import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateConfirmationTokenRequest {
  userId: string
  email: string
  name: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, email, name }: CreateConfirmationTokenRequest = await req.json()

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar token aleatorio de 6 dígitos
    const token = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Expiración: 24 horas
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Limpiar tokens viejos del mismo usuario
    await supabase
      .from('email_confirmation_tokens')
      .delete()
      .eq('user_id', userId)
      .or('expires_at.lt.now(),used.eq.true')

    // Insertar nuevo token
    const { error: insertError } = await supabase
      .from('email_confirmation_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
        used: false,
      })

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create confirmation token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar email con Brevo
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')
    const brevoSenderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
    const brevoSenderName = Deno.env.get('BREVO_SENDER_NAME')

    if (!brevoApiKey || !brevoSenderEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing Brevo configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const confirmUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/confirmar-email?token=${token}`

    const emailHtml = `
      <h2>¡Bienvenido a Ofertas Ocaña!</h2>
      <p>Hola ${name || 'Usuario'},</p>
      <p>Gracias por registrarte en nuestra plataforma.</p>
      <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
      <p><a href="${confirmUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirmar mi cuenta</a></p>
      <p>O usa este código: <strong>${token}</strong></p>
      <p>Este enlace expira en 24 horas.</p>
      <p>Si no solicitaste este registro, ignora este correo.</p>
      <p>Saludos,<br>El equipo de Ofertas Ocaña</p>
    `

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
        subject: 'Confirma tu cuenta de Ofertas Ocaña',
        htmlContent: emailHtml,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error de Brevo:', error)
      // Devolver el token como fallback
      return new Response(
        JSON.stringify({ success: true, token, fallback: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
