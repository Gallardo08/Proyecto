export type FlowStep = { actor: string; system: string };
export type UseCase = {
  id: string;
  name: string;
  actor: string;
  summary: string;
  pre: string;
  post: string;
  includes: string[];
  extends: string;
  inherits: string;
  flow: FlowStep[];
};

export const useCases: UseCase[] = [
  {
    id: "iniciar-sesion",
    name: "Iniciar sesión",
    actor: "Emprendedor — Administrador",
    summary:
      "El emprendedor ingresa a la página introduciendo su teléfono o correo electrónico y su contraseña para acceder a su cuenta y utilizar los servicios del sistema.",
    pre: "El emprendedor debe estar registrado previamente en la página web y tener acceso a sus datos de inicio de sesión.",
    post: "El sistema permite al emprendedor acceder a su cuenta y utilizar las funciones.",
    includes: [
      "Ingresar correo electrónico o número de teléfono",
      "Ingresar contraseña",
      "Validar los datos de usuario",
    ],
    extends: "Recuperar contraseña (cuando se le olvida la contraseña)",
    inherits: "Usuario",
    flow: [
      { actor: "Selecciona la opción iniciar sesión", system: "Muestra el formulario de inicio de sesión" },
      { actor: "Ingresar correo electrónico o número de teléfono", system: "Habilita el campo de contraseña" },
      { actor: "Ingresar contraseña", system: "Valida que los campos no estén vacíos" },
      { actor: "Presiona iniciar sesión", system: "Verifica los datos en la base de datos" },
    ],
  },
  {
    id: "crear-cuenta",
    name: "Crear cuenta",
    actor: "Emprendedor",
    summary:
      "El usuario se registra en la página web ingresando sus datos personales: nombre del emprendimiento, nombre de usuario, número de WhatsApp y una contraseña para crear una cuenta.",
    pre: "El usuario no debe tener una cuenta registrada en el sistema.",
    post: "El sistema crea una cuenta nueva y el usuario puede iniciar sesión para acceder a la página.",
    includes: [
      "Ingresar nombre del emprendimiento",
      "Crear nombre de usuario",
      "Subir foto de perfil",
      "Ingresar número de WhatsApp",
      "Crear contraseña",
      "Ubicación",
      "Guardar datos del usuario",
    ],
    extends: "Confirmar cuenta (si el sistema envía un código)",
    inherits: "Usuario",
    flow: [
      { actor: "Seleccionar la opción de crear cuenta", system: "Muestra el formulario de registro" },
      { actor: "Ingresar nombre del emprendimiento", system: "Habilita los siguientes campos" },
      { actor: "Subir foto de perfil", system: "Carga y guarda la imagen" },
      { actor: "Ingresar nombre de usuario", system: "Valida que el usuario no esté repetido" },
      { actor: "Ingresar número de teléfono o WhatsApp", system: "Verifica el formato del número" },
      { actor: "Crear e ingresar contraseña", system: "Valida que la contraseña cumpla requisitos" },
      { actor: "Presiona crear cuenta", system: "Guarda los datos en el sistema" },
    ],
  },
  {
    id: "publicar-producto",
    name: "Publicar producto",
    actor: "Emprendedor",
    summary:
      "El emprendedor crea y publica un producto ingresando imágenes, nombre, descripción, precio, descuento, categoría y fecha, para que los visitantes puedan verlo y contactarlo.",
    pre: "El emprendedor debe estar registrado e iniciar sesión en la plataforma.",
    post: "El producto queda publicado en el catálogo y visible para los visitantes.",
    includes: [
      "Seleccionar categoría del producto",
      "Subir foto del producto",
      "Ingresar nombre del producto",
      "Escribir descripción",
      "Ingresar fecha",
      "Colocar precio",
      "Colocar descuento",
    ],
    extends: "Editar publicación",
    inherits: "Usuario",
    flow: [
      { actor: "Selecciona publicar producto", system: "Muestra opciones de categorías" },
      { actor: "Elige categoría", system: "Muestra formulario de publicación" },
      { actor: "Sube foto del producto", system: "Carga y guarda la imagen" },
      { actor: "Ingresar nombre, descripción, ubicación, precio y descuento", system: "Valida los datos ingresados" },
      { actor: "Ingresar fecha", system: "Verifica que la fecha sea válida" },
      { actor: "Presionar publicar", system: "Guarda la información" },
    ],
  },
  {
    id: "ver-publicaciones",
    name: "Ver publicaciones de un negocio",
    actor: "Visitante",
    summary:
      "Permite al visitante visualizar la información completa de un negocio publicado en la página web, incluyendo descripción, ubicación, contacto y promociones.",
    pre: "Deben existir publicaciones en el sistema.",
    post: "El visitante visualiza la información del negocio elegido.",
    includes: ["Ingresar a la página principal", "Ver lista de negocios", "Seleccionar un negocio"],
    extends: "Buscar negocio",
    inherits: "Usuario",
    flow: [
      { actor: "Ingresar a la página principal", system: "Muestra lista de negocios" },
      { actor: "Seleccionar un negocio", system: "Muestra información del negocio" },
    ],
  },
  {
    id: "contactar-emprendedor",
    name: "Contactar al emprendedor",
    actor: "Visitante",
    summary:
      "Permite al visitante comunicarse con el emprendedor a través de la página web para solicitar información, realizar consultas o expresar interés por un producto o servicio.",
    pre: "Debe existir un medio de contacto (API, WhatsApp, chat, etc.) y un enlace hacia la red social del emprendedor.",
    post: "El visitante establece comunicación con el emprendedor.",
    includes: ["Escribir mensaje", "Enviar mensaje", "Redirigir a red social"],
    extends: "No aplica",
    inherits: "Usuario",
    flow: [
      { actor: "Escribe y envía un mensaje", system: "Permite la comunicación con el emprendedor" },
      { actor: "—", system: "Redirige a la red social del emprendedor" },
    ],
  },
  {
    id: "gestion-cuentas",
    name: "Gestión de cuentas de usuarios",
    actor: "Administrador",
    summary:
      "El administrador supervisa la base de datos de los emprendedores registrados para validar su autenticidad, activar cuentas nuevas o bloquear aquellas con comportamientos fraudulentos.",
    pre: "El administrador debe haber iniciado sesión con privilegios.",
    post: "El estado de la cuenta del emprendedor queda actualizado.",
    includes: ["Ver lista de emprendedores", "Ver detalle de cuenta", "Activar / Bloquear cuenta"],
    extends: "Notificar cambio",
    inherits: "Usuario",
    flow: [
      { actor: "Ingresa al panel de gestión", system: "Muestra la lista completa de emprendedores con su estado" },
      { actor: "Selecciona un usuario para revisar", system: "Despliega información detallada y fotos cargadas" },
      { actor: "Determina el estado de la cuenta", system: "Valida la acción y actualiza permisos en la BD" },
      { actor: "Presiona guardar cambios", system: "Confirma la gestión y refresca la lista" },
    ],
  },
  {
    id: "configuracion",
    name: "Configuración del sistema",
    actor: "Administrador",
    summary:
      "El administrador gestiona los parámetros generales: creación de nuevas categorías de productos y actualización de la información de contacto oficial (WhatsApp).",
    pre: "El administrador debe haber iniciado sesión.",
    post: "Los parámetros del sistema quedan actualizados.",
    includes: ["Crear categorías", "Actualizar contacto oficial", "Guardar configuración"],
    extends: "No aplica",
    inherits: "Usuario",
    flow: [
      { actor: "Selecciona la opción configuración", system: "Muestra el formulario con los datos actuales" },
      { actor: "Hace los cambios necesarios", system: "—" },
      { actor: "Presiona el botón actualizar", system: "Guarda los cambios en la base de datos" },
    ],
  },
  {
    id: "soporte-whatsapp",
    name: "Gestión de soporte e interacción (API WhatsApp)",
    actor: "Administrador, Emprendedor",
    summary:
      "El administrador gestiona solicitudes de soporte técnico, dudas comerciales y peticiones de destacados desde los emprendedores a través de la API de WhatsApp.",
    pre: "Debe existir integración con la API de WhatsApp y número oficial configurado.",
    post: "La conversación entre administrador y emprendedor queda establecida.",
    includes: ["Generar URL de WhatsApp", "Enviar mensaje automático", "Atender solicitud"],
    extends: "Aplicar cambios solicitados",
    inherits: "Usuario",
    flow: [
      { actor: "El emprendedor selecciona contactar al administrador", system: "Genera URL de la API de WhatsApp con mensaje automático" },
      { actor: "El administrador recibe el mensaje y responde", system: "Permite interacción bidireccional fuera del servidor" },
      { actor: "El administrador (opcional) regresa al panel", system: "Refleja los cambios en la cuenta del emprendedor" },
    ],
  },
  {
    id: "recuperar-contrasena",
    name: "Recuperar contraseña",
    actor: "Emprendedor — Administrador",
    summary:
      "Permite al usuario restablecer su contraseña cuando la ha olvidado, mediante validación por correo o WhatsApp.",
    pre: "El usuario debe estar registrado en el sistema.",
    post: "El usuario obtiene una nueva contraseña y puede iniciar sesión.",
    includes: ["Ingresar correo o teléfono", "Recibir código", "Ingresar nueva contraseña"],
    extends: "No aplica",
    inherits: "Usuario",
    flow: [
      { actor: "Selecciona ¿olvidaste tu contraseña?", system: "Muestra formulario de recuperación" },
      { actor: "Ingresa correo o teléfono", system: "Envía código de verificación" },
      { actor: "Ingresa código y nueva contraseña", system: "Actualiza la contraseña en la BD" },
    ],
  },
];
