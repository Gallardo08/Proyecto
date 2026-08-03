import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function useSendEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (params: SendEmailParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke("send-email", {
        body: params,
      });

      if (functionError) {
        setError(functionError.message);
        return { success: false, error: functionError.message };
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al enviar email";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { sendEmail, isLoading, error };
}
