# Dashboard de Gestión de Procesos - Universidad Central

Dashboard profesional e interactivo para visualizar y gestionar el avance en la documentación de procesos y procedimientos institucionales de la Universidad Central.

## 🎯 Características Principales

### Panel de Visualización Pública
- **Filtros Interconectados**: Sistema, Subsistema, Estado, Área Líder, Gestor Funcional
- **Gráficos Interactivos**: 
  - Gráfico de dona con distribución por estado
  - Gráfico de barras con avance por sistema
  - Tarjetas KPI con métricas destacadas
- **Tabla Detallada**: 
  - Ordenamiento por columnas
  - Búsqueda en tiempo real
  - Paginación
  - Exportación a Excel
- **Semaforización Visual**: Colores según porcentaje de avance
- **Panel de Convenciones**: Explicación de estados y porcentajes

### Panel Administrativo
- **Autenticación Segura**: Login con usuario y contraseña
- **Importación de Datos**: Carga de archivos Excel/CSV con preview
- **Gestión de Procedimientos**: CRUD completo (próximamente)
- **Configuración Visual**: Personalización de estados y colores (próximamente)

## 🚀 Inicio Rápido

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- No requiere instalación de dependencias

### Instalación

1. **Descargar el proyecto**
   ```
   El proyecto ya está en: C:\Users\ralvaradoa\.gemini\antigravity\scratch\dashboard-universidad-central
   ```

2. **Abrir el dashboard**
   - Opción 1: Doble clic en `index.html`
   - Opción 2: Usar un servidor local (recomendado)
     ```powershell
     # Si tienes Python instalado:
     python -m http.server 8000
     
     # Si tienes Node.js instalado:
     npx http-server
     ```
   - Luego abrir: `http://localhost:8000`

## 📊 Uso del Dashboard

### Vista Pública

1. **Filtrar por Sistema**: Haz clic en los chips superiores (Rectoría, Vicerrectorías)
2. **Filtros Adicionales**: Usa el panel izquierdo para filtrar por subsistema, área o gestor
3. **Filtrar por Estado**: Usa el panel derecho para ver procedimientos en estados específicos
4. **Buscar en Tabla**: Usa el campo de búsqueda para encontrar procedimientos específicos
5. **Ordenar Tabla**: Haz clic en los encabezados de columna para ordenar
6. **Exportar Datos**: Usa los botones "Exportar Excel" o "Exportar PDF"

### Panel Administrativo

1. **Acceder al Panel Admin**: Haz clic en "Panel Administrativo" en el header
2. **Iniciar Sesión**:
   - Usuario: `admin`
   - Contraseña: `admin123`
   
   ⚠️ **IMPORTANTE**: Cambia estas credenciales en producción

3. **Importar Datos**:
   - Arrastra un archivo Excel/CSV o haz clic para seleccionar
   - Revisa la vista previa de datos
   - Confirma la importación

## 📁 Estructura del Proyecto

```
dashboard-universidad-central/
├── index.html              # Página principal
├── styles/
│   ├── globals.css         # Estilos globales y variables
│   └── dashboard.css       # Estilos específicos del dashboard
├── js/
│   ├── data.js            # Gestión de datos y estados
│   ├── charts.js          # Gráficos con Chart.js
│   ├── filters.js         # Sistema de filtros
│   ├── table.js           # Tabla interactiva
│   ├── admin.js           # Panel administrativo
│   └── app.js             # Coordinación general
└── README.md              # Este archivo
```

## 📋 Formato de Datos para Importación

### Estructura del Archivo Excel/CSV

El archivo debe contener las siguientes columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| Nombre del Procedimiento | Nombre completo | Gestión de Recursos Humanos |
| Sistema | Uno de los 4 sistemas | Vicerrectoría Administrativa y Financiera |
| Subsistema | Subsistema correspondiente | Talento Humano |
| Área Líder | Área responsable | Recursos Humanos |
| Gestor Funcional | Nombre del gestor | María González |
| Estado | Estado actual | En el sistema |

### Estados Válidos

| Estado | % Avance | Color |
|--------|----------|-------|
| Pendiente | 0% | Rojo |
| En Elaboración | 20% | Naranja |
| En revisión | 40% | Amarillo |
| Pendiente Ajustes | 60% | Amarillo claro |
| Ajustado | 70% | Verde lima |
| Aprobado | 80% | Verde |
| En el sistema | 100% | Verde oscuro |

### Sistemas Válidos

1. Rectoría
2. Vicerrectoría Administrativa y Financiera
3. Vicerrectoría Académica
4. Vicerrectoría de Programas

## 🎨 Personalización

### Colores Institucionales

Los colores se definen en `styles/globals.css`:

```css
:root {
    --uc-green-primary: #2d5f3f;
    --uc-green-light: #4ade80;
    --uc-green-dark: #166534;
    --uc-green-accent: #86efac;
}
```

### Modificar Estados

Edita el array `ESTADOS` en `js/data.js`:

```javascript
const ESTADOS = [
    { nombre: 'Pendiente', porcentaje: 0, color: '#ef4444', descripcion: '...' },
    // ... más estados
];
```

## 🔐 Seguridad

### Recomendaciones para Producción

1. **Cambiar Credenciales**: Modifica las credenciales en `js/admin.js`
2. **Implementar Backend**: Mover autenticación y datos a un servidor
3. **Usar HTTPS**: Asegurar todas las comunicaciones
4. **Validación de Datos**: Validar todos los inputs del usuario
5. **Encriptación**: Usar bcrypt para contraseñas

### Credenciales Actuales (Solo para Desarrollo)

```
Usuario: admin
Contraseña: admin123
```

## 📱 Responsive Design

El dashboard es completamente responsive y se adapta a:
- 📱 Móviles (< 768px)
- 📱 Tablets (768px - 1024px)
- 💻 Desktop (> 1024px)
- 🖥️ Pantallas grandes (> 1400px)

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con glassmorphism
- **JavaScript (Vanilla)**: Lógica de aplicación
- **Chart.js**: Gráficos interactivos
- **SheetJS (XLSX)**: Importación/exportación de Excel
- **Google Fonts (Inter)**: Tipografía moderna

## 📝 Próximas Funcionalidades

- [ ] CRUD completo de procedimientos en panel admin
- [ ] Exportación a PDF con diseño personalizado
- [ ] Gráfico de línea de tiempo de progreso
- [ ] Historial de cambios y auditoría
- [ ] Notificaciones y alertas
- [ ] Integración con API backend
- [ ] Autenticación con múltiples roles
- [ ] Dashboard de métricas avanzadas

## 🐛 Solución de Problemas

### Los gráficos no se muestran
- Verifica que tienes conexión a internet (Chart.js se carga desde CDN)
- Abre la consola del navegador (F12) para ver errores

### Los datos no se guardan
- Verifica que el navegador permite localStorage
- Revisa la configuración de privacidad del navegador

### El archivo Excel no se importa
- Verifica que el formato sea .xlsx, .xls o .csv
- Asegúrate de que las columnas coincidan con el formato esperado
- Revisa que los nombres de estados y sistemas sean exactos

## 📞 Soporte

Para preguntas o problemas:
- Revisa la consola del navegador (F12) para mensajes de error
- Verifica que todos los archivos estén en su ubicación correcta
- Asegúrate de usar un navegador moderno actualizado

## 📄 Licencia

Este proyecto fue desarrollado para la Universidad Central.

---

**Desarrollado con ❤️ para la Universidad Central**

*Versión 1.0.0 - Febrero 2026*
