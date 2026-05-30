# Ofertas Ocana

Aplicacion web para conectar emprendimientos locales de Ocana con clientes interesados en productos, ofertas y servicios. El proyecto permite explorar un catalogo publico, filtrar publicaciones por categoria, contactar negocios por WhatsApp y administrar productos desde un panel privado.

## Caracteristicas

- Catalogo publico de productos y negocios locales.
- Busqueda por producto, negocio, descripcion o categoria.
- Filtro por categorias.
- Vista de detalle de producto con informacion del negocio.
- Registro, inicio de sesion, recuperacion de cuenta y callback de autenticacion.
- Panel para emprendedores con creacion, edicion y eliminacion de productos.
- Carga de imagenes de productos en Supabase Storage.
- Panel de administracion para gestionar cuentas, categorias y WhatsApp oficial.
- Proteccion de rutas por rol: `emprendedor` y `admin`.
- Base de datos con politicas RLS en Supabase.

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui y Radix UI
- React Router
- TanStack Query
- Zustand
- Supabase Auth, Database y Storage
- Vitest

## Requisitos

- Node.js 18 o superior
- npm
- Proyecto de Supabase configurado

## Instalacion

```bash
npm install
```

Copia el archivo de variables de entorno:

```bash
cp .env.example .env.local
```

En Windows PowerShell tambien puedes usar:

```powershell
Copy-Item .env.example .env.local
```

Luego completa `.env.local` con los datos de Supabase:

```env
VITE_SUPABASE_URL=https://TU_REFERENCIA.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
```

Los valores se encuentran en Supabase en `Project Settings -> API`.

## Base de datos

Las migraciones estan en la carpeta `supabase/migrations`:

- `001_schema_and_rls.sql`: tablas principales, tipos, triggers y politicas RLS.
- `002_storage_and_categories.sql`: configuracion de storage y categorias iniciales.
- `003_email_activation.sql`: flujo de activacion por correo.
- `004_public_catalog_read.sql`: lectura publica del catalogo.

Puedes ejecutarlas desde el SQL Editor de Supabase o con la CLI de Supabase:

```bash
supabase db push
```

El esquema principal incluye:

- `profiles`: perfiles de usuarios y roles.
- `businesses`: informacion de los emprendimientos.
- `categories`: categorias del catalogo.
- `products`: publicaciones de productos.
- `system_settings`: configuraciones generales.

Tambien se usa el bucket `products-images` para las imagenes de productos.

## Scripts disponibles

```bash
npm run dev
```

Inicia el servidor de desarrollo.

```bash
npm run build
```

Genera la version de produccion.

```bash
npm run build:dev
```

Genera una compilacion usando modo `development`.

```bash
npm run preview
```

Sirve localmente la compilacion generada.

```bash
npm run lint
```

Ejecuta ESLint sobre el proyecto.

```bash
npm run test
```

Ejecuta las pruebas con Vitest.

```bash
npm run test:watch
```

Ejecuta Vitest en modo observacion.

## Rutas principales

- `/`: pagina de inicio y catalogo.
- `/producto/:id`: detalle de producto.
- `/login`: inicio de sesion.
- `/registro`: registro de emprendedores.
- `/recuperar`: recuperacion de cuenta.
- `/auth/callback`: callback de Supabase Auth.
- `/casos-de-uso`: casos de uso de la plataforma.
- `/panel`: panel privado para emprendedores.
- `/admin`: panel privado para administradores.

## Estructura del proyecto

```text
.
+-- scripts/              # Wrappers para comandos de Vite
+-- src/
|   +-- components/       # Componentes reutilizables y UI
|   +-- data/             # Datos mock y casos de uso
|   +-- hooks/            # Hooks de auth y Supabase
|   +-- lib/              # Utilidades y cliente Supabase
|   +-- pages/            # Pantallas principales
|   +-- store/            # Estado global con Zustand
|   +-- test/             # Configuracion y pruebas
|   +-- types/            # Tipos de base de datos
+-- supabase/
    +-- migrations/       # Migraciones SQL
```

## Flujo de uso

1. Un visitante entra al catalogo, busca productos o filtra por categoria.
2. El visitante abre un producto y puede contactar al negocio por WhatsApp.
3. Un emprendedor se registra y configura su negocio.
4. El emprendedor accede a `/panel` para publicar y administrar productos.
5. Un administrador accede a `/admin` para gestionar cuentas y configuraciones.

## Notas de desarrollo

- La app requiere `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para conectarse a Supabase.
- Las rutas protegidas validan el rol del usuario antes de mostrar el panel correspondiente.
- Las operaciones de productos usan TanStack Query para cache e invalidacion.
- Las politicas RLS de Supabase son parte importante de la seguridad del proyecto.
