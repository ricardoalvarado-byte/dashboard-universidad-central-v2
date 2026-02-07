# 🚀 Guía de Inicio Rápido - Dashboard Universidad Central

## ✅ Dashboard Creado Exitosamente

Tu dashboard profesional está listo y funcionando en:
📁 `C:\Users\ralvaradoa\.gemini\antigravity\scratch\dashboard-universidad-central`

---

## 🎯 Cómo Usar el Dashboard

### Opción 1: Inicio Rápido (Recomendado)
1. Haz doble clic en: **`INICIAR_DASHBOARD.bat`**
2. El dashboard se abrirá automáticamente en tu navegador

### Opción 2: Abrir Manualmente
1. Navega a la carpeta del proyecto
2. Haz doble clic en **`index.html`**

### Opción 3: Generar Datos de Ejemplo
1. Abre **`generar-ejemplo.html`**
2. Haz clic en "Descargar Excel de Ejemplo"
3. Usa ese archivo para probar la importación

---

## 📊 Funcionalidades Principales

### 🌐 PANEL PÚBLICO (Vista Principal)

#### 1️⃣ Filtros Superiores
- **Chips de Sistema**: Haz clic para filtrar por Rectoría o Vicerrectorías
- Los gráficos y tabla se actualizan automáticamente

#### 2️⃣ Panel Izquierdo
- **Subsistema**: Selecciona del dropdown
- **Área Líder**: Escribe para buscar
- **Gestor Funcional**: Escribe para buscar
- **Limpiar Filtros**: Botón para resetear todo

#### 3️⃣ Panel Derecho
- **Filtro por Estado**: Haz clic en cualquier estado
- Muestra el porcentaje de avance de cada estado
- Semaforización con colores

#### 4️⃣ Zona Central

**KPIs (Tarjetas Superiores):**
- 📊 Avance Global
- ✅ Procedimientos en el Sistema
- ⏳ Procedimientos en Proceso
- 🎯 Sistema Líder

**Gráficos:**
- 🍩 **Gráfico de Dona**: Distribución por estado
- 📊 **Gráfico de Barras**: Avance por sistema
- Pasa el cursor sobre los gráficos para ver detalles

**Panel de Convenciones:**
- Muestra todos los estados con sus colores
- Porcentaje de avance de cada estado
- Cantidad de procedimientos por estado

**Tabla Detallada:**
- 🔍 **Búsqueda**: Campo superior derecho
- 📋 **Ordenar**: Haz clic en los encabezados de columna
- 📄 **Paginación**: Navega entre páginas al final
- 📥 **Exportar**: Botones para Excel y PDF

---

### 🔐 PANEL ADMINISTRATIVO

#### Acceder al Panel Admin
1. Haz clic en **"Panel Administrativo"** en el header
2. Ingresa credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

#### Importar Datos

**Pestaña "Importar Datos":**

1. **Opción A - Drag & Drop:**
   - Arrastra un archivo Excel/CSV al área de carga
   
2. **Opción B - Seleccionar:**
   - Haz clic en el área de carga
   - Selecciona tu archivo

3. **Vista Previa:**
   - Revisa los datos antes de importar
   - Verifica que todo esté correcto

4. **Confirmar:**
   - Haz clic en "Confirmar Importación"
   - Los datos se cargarán automáticamente

**Formatos Soportados:**
- `.xlsx` (Excel moderno)
- `.xls` (Excel antiguo)
- `.csv` (Valores separados por comas)

---

## 📋 Estructura del Archivo Excel

Tu archivo debe tener estas columnas (en este orden):

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **Nombre del Procedimiento** | Nombre completo | Gestión de Recursos Humanos |
| **Sistema** | Uno de los 4 sistemas | Vicerrectoría Administrativa y Financiera |
| **Subsistema** | Subsistema correspondiente | Talento Humano |
| **Área Líder** | Área responsable | Recursos Humanos |
| **Gestor Funcional** | Nombre del gestor | María González |
| **Estado** | Estado actual | En el sistema |

### Estados Válidos (Copiar exactamente):
- `Pendiente` (0%)
- `En Elaboración` (20%)
- `En revisión` (40%)
- `Pendiente Ajustes` (60%)
- `Ajustado` (70%)
- `Aprobado` (80%)
- `En el sistema` (100%)

### Sistemas Válidos (Copiar exactamente):
- `Rectoría`
- `Vicerrectoría Administrativa y Financiera`
- `Vicerrectoría Académica`
- `Vicerrectoría de Programas`

---

## 🎨 Características Visuales

✨ **Diseño Moderno:**
- Efectos glassmorphism (cristal/vidrio)
- Degradados verdes institucionales
- Animaciones suaves
- Semaforización por colores

📱 **Responsive:**
- Funciona en móviles, tablets y desktop
- Se adapta automáticamente al tamaño de pantalla

🎯 **Interactivo:**
- Tooltips informativos
- Filtros en tiempo real
- Gráficos animados
- Transiciones suaves

---

## ⌨️ Atajos de Teclado

- **Ctrl + K**: Enfocar búsqueda en tabla
- **Escape**: Limpiar búsqueda (cuando está enfocada)

---

## 💾 Persistencia de Datos

Los datos se guardan automáticamente en el navegador (localStorage):
- ✅ Los cambios persisten al cerrar el navegador
- ✅ No se pierden datos al recargar la página
- ⚠️ Si limpias el caché del navegador, se borrarán los datos

---

## 🔄 Flujo de Trabajo Recomendado

### Primera Vez:
1. ✅ Abre el dashboard
2. ✅ Explora los datos de ejemplo
3. ✅ Prueba los filtros y gráficos
4. ✅ Genera un Excel de ejemplo (`generar-ejemplo.html`)
5. ✅ Accede al panel admin
6. ✅ Importa el Excel de ejemplo
7. ✅ Verifica que todo funcione correctamente

### Uso Regular:
1. Abre el dashboard
2. Accede al panel admin
3. Importa tu archivo Excel actualizado
4. Vuelve a la vista pública
5. Analiza los datos con filtros y gráficos
6. Exporta reportes cuando necesites

---

## 🛠️ Solución de Problemas

### ❌ Los gráficos no se muestran
**Solución:** Verifica tu conexión a internet (Chart.js se carga desde CDN)

### ❌ El archivo Excel no se importa
**Soluciones:**
1. Verifica que las columnas coincidan exactamente
2. Revisa que los estados estén escritos correctamente
3. Asegúrate de que los sistemas sean válidos
4. Abre la consola del navegador (F12) para ver errores

### ❌ Los datos no se guardan
**Solución:** Verifica que el navegador permita localStorage (configuración de privacidad)

### ❌ La página se ve mal
**Soluciones:**
1. Usa un navegador moderno (Chrome, Firefox, Edge)
2. Actualiza tu navegador a la última versión
3. Desactiva extensiones que puedan interferir

---

## 📞 Próximos Pasos

### Funcionalidades Futuras:
- [ ] CRUD completo en panel admin
- [ ] Exportación a PDF personalizada
- [ ] Gráfico de línea de tiempo
- [ ] Historial de cambios
- [ ] Múltiples roles de usuario
- [ ] Integración con backend

### Para Producción:
1. **Cambiar credenciales** en `js/admin.js`
2. **Implementar backend** para mayor seguridad
3. **Configurar servidor web** (Apache, Nginx, IIS)
4. **Usar HTTPS** para conexiones seguras
5. **Implementar base de datos** real (PostgreSQL, MySQL)

---

## 📁 Archivos del Proyecto

```
dashboard-universidad-central/
├── 📄 index.html                    # Página principal
├── 📄 generar-ejemplo.html          # Generador de Excel
├── 📄 INICIAR_DASHBOARD.bat         # Script de inicio rápido
├── 📄 README.md                     # Documentación completa
├── 📄 GUIA_RAPIDA.md               # Esta guía
├── styles/
│   ├── 🎨 globals.css              # Estilos globales
│   └── 🎨 dashboard.css            # Estilos del dashboard
└── js/
    ├── 📊 data.js                  # Gestión de datos
    ├── 📈 charts.js                # Gráficos
    ├── 🔍 filters.js               # Sistema de filtros
    ├── 📋 table.js                 # Tabla interactiva
    ├── 🔐 admin.js                 # Panel administrativo
    └── ⚙️ app.js                   # Coordinación general
```

---

## ✅ Checklist de Verificación

Antes de usar en producción, verifica:

- [ ] El dashboard se abre correctamente
- [ ] Los gráficos se visualizan bien
- [ ] Los filtros funcionan correctamente
- [ ] La tabla se ordena y pagina bien
- [ ] La búsqueda funciona
- [ ] La exportación a Excel funciona
- [ ] El login administrativo funciona
- [ ] La importación de Excel funciona
- [ ] Los datos persisten al recargar
- [ ] El diseño es responsive en móvil
- [ ] Has cambiado las credenciales de admin
- [ ] Has probado con tus datos reales

---

## 🎓 ¡Listo para Usar!

Tu dashboard está completamente funcional y listo para:
- ✅ Visualizar datos de procedimientos
- ✅ Filtrar y analizar información
- ✅ Generar reportes
- ✅ Importar datos desde Excel
- ✅ Presentar a stakeholders

**¡Disfruta tu nuevo dashboard profesional!** 🚀

---

*Desarrollado con ❤️ para la Universidad Central*
*Versión 1.0.0 - Febrero 2026*
