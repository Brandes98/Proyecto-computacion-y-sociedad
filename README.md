# PubliCloud - Plataforma de Diseño

Una plataforma web para compartir y descubrir diseños creativos.

## Estructura del Proyecto

```
Proyecto-computacion-y-sociedad/
├── index.html          # Página principal
├── login.html          # Página de inicio de sesión
├── register.html       # Página de registro
├── dashboard.html      # Panel de usuario
├── upload.html         # Subir diseños
├── styles.css          # Estilos principales
├── js/
│   ├── main.js         # Funcionalidad general
│   ├── auth.js         # Autenticación
│   ├── dashboard.js    # Panel de usuario
│   └── upload.js       # Subida de archivos
└── img/
    ├── logo.svg        # Logo de la aplicación
```


## Funcionalidades

### Autenticación
- **Registro de usuarios**: Crear cuenta con nombre, email y contraseña
- **Inicio de sesión**: Acceso con credenciales
- **Protección de rutas**: Dashboard y upload requieren autenticación
- **Persistencia**: Los datos se guardan en localStorage

### Navegación
- **Página principal**: Presentación de la plataforma
- **Dashboard**: Panel personal del usuario
- **Upload**: Formulario para subir diseños
- **Logout**: Cerrar sesión desde cualquier página protegida

### Gestión de Diseños
- **Subir diseños**: Formulario con título, descripción, categoría y archivo
- **Visualizar diseños**: Grid de diseños del usuario
- **Categorías**: Ilustración, Diseño Gráfico, Fotografía, etc.
- **Interacciones**: Like y eliminar diseños

### Almacenamiento
- **LocalStorage**: Usuarios y diseños se almacenan localmente
- **Persistencia**: Los datos se mantienen entre sesiones

## Cómo usar

1. **Abrir la aplicación**: Abre `index.html` en tu navegador
2. **Registrarse**: Haz clic en "Registrarse" y completa el formulario
3. **Iniciar sesión**: Usa tus credenciales para acceder
4. **Subir diseño**: Ve a "Nuevo" y completa el formulario de upload
5. **Ver diseños**: En el dashboard puedes ver tus diseños subidos

## Tecnologías

- **HTML5**: Estructura de las páginas
- **CSS3**: Estilos y diseño responsive
- **JavaScript**: Interactividad y funcionalidad
- **LocalStorage**: Persistencia de datos

## Desarrollo

Para desarrollo local, simplemente abre los archivos HTML en un navegador web moderno. No se requiere servidor web para las funcionalidades básicas.

### Estructura de datos

Los datos se almacenan en localStorage con las siguientes estructuras:

```javascript
// Usuarios
{
  id: timestamp,
  name: "Nombre Usuario",
  email: "email@ejemplo.com",
  password: "contraseña",
  joinDate: "ISO Date"
}

// Diseños
{
  id: timestamp,
  title: "Título del diseño",
  description: "Descripción",
  category: "categoria",
  authorId: userId,
  authorName: "Nombre del autor",
  uploadDate: "ISO Date",
  likes: 0,
  fileName: "archivo.jpg"
}
```

## Próximas mejoras

- [ ] Búsqueda de diseños
- [ ] Sistema de comentarios
- [ ] Perfiles públicos de usuarios
- [ ] Compartir diseños en redes sociales
- [ ] Subida múltiple de archivos
- [ ] Sistema de notificaciones
- [ ] Modo oscuro