Reglas del proyecto
Stack

React 18 con componentes funcionales y Hooks. Cero componentes de clase.
TypeScript en modo estricto. Prohibido usar "any". Si un tipo es incierto, usa "unknown" y valida con Zod.
Tailwind CSS para todo el estilado. No escribas CSS en archivos .css salvo configuración global.
shadcn/ui para componentes de interfaz. No reinventes botones, inputs o modales desde cero.
Zustand para estado global. TanStack Query para todo estado del servidor (fetch, cache, mutaciones).
Supabase como backend. Toda tabla tiene políticas RLS activas.

Reglas de tipos con Supabase

Nunca inventes tipos de tablas o columnas de Supabase.
Usa siempre los tipos generados por supabase gen types typescript.
Si no existe el archivo de tipos generado, pide que se genere antes de escribir código que dependa de la base de datos.

Convenciones de código

Nombra los hooks personalizados con el prefijo "use".
Cada componente exporta un solo componente principal por archivo.
Las mutaciones de Supabase siempre manejan el caso de error de RLS explícitamente.

Prohibido

No agregues librerías nuevas sin preguntar primero.
No cambies la estructura de carpetas existente sin justificación.