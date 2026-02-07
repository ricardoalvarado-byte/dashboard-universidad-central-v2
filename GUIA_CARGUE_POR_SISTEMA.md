# 📤 Guía de Cargue de Datos por Sistema

## 🎯 Nuevo Sistema de Importación

El dashboard ahora permite **cargar datos de forma independiente** para cada uno de los 4 sistemas de la universidad. Esto facilita la gestión cuando cada área mantiene su propio archivo Excel.

---

## 📋 Los 4 Sistemas

1. **📋 Rectoría**
2. **💼 Vicerrectoría Administrativa y Financiera**
3. **🎓 Vicerrectoría Académica**
4. **🚀 Vicerrectoría de Programas**

---

## 🔐 Acceso al Panel de Cargue

1. Haz clic en **"Panel Administrativo"** en el header
2. Ingresa credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`
3. Verás 4 tarjetas, una para cada sistema

---

## 📥 Cómo Cargar Datos de un Sistema

### Opción 1: Arrastrar y Soltar (Drag & Drop)
1. Arrastra tu archivo Excel sobre la tarjeta del sistema correspondiente
2. Espera la vista previa
3. Haz clic en **"Confirmar"**

### Opción 2: Seleccionar Archivo
1. Haz clic en la tarjeta del sistema
2. Selecciona tu archivo Excel
3. Espera la vista previa
4. Haz clic en **"Confirmar"**

---

## ⚠️ Importante: Estructura del Archivo

### ✅ Columnas Soportadas por el Sistema
El sistema detecta automáticamente los siguientes nombres de columnas:

| Columnas Detectadas | Descripción | Ejemplo |
|---------------------|-------------|---------|
| **NOMBRE PROCEDIMIENTO** | Nombre completo | Gestión de Recursos Humanos |
| **SUBSISTEMA** | Subsistema correspondiente | Talento Humano |
| **AREA LÍDER** | Área responsable | Recursos Humanos |
| **GESTOR FUNCIONAL PROCESO** | Nombre del gestor | María González |
| **ESTADO GENERAL** | Estado actual | En el sistema |

### 🔧 Columnas Opcionales (No son necesarias pero se usan si existen):
- **N ID** - Identificador (se ignora)
- **PROCESO** - Proceso asociado
- **GESTOR OPERATIVO PROCESO** - Gestor operativo
- **TIPO** - Tipo de procedimiento
- **N°** - Número de procedimiento
- **SEGUIMIENTO** - Información de seguimiento
- **RESPONSABLE CP** - Responsable
- **SISTEMA** - Se asigna automáticamente según la tarjeta donde cargues

### ✅ El sistema se asigna automáticamente

Cuando cargas un archivo en la tarjeta de **"Rectoría"**, todos los procedimientos se marcarán automáticamente como `sistema: "Rectoría"`.

---

## 🔄 Comportamiento de Reemplazo

### Al cargar datos de un sistema:
1. ✅ Se **eliminan** todos los procedimientos anteriores de ese sistema
2. ✅ Se **agregan** los nuevos procedimientos del archivo
3. ✅ Los datos de **otros sistemas NO se afectan**

### Ejemplo:
```
Estado inicial:
- Rectoría: 10 procedimientos
- V. Administrativa: 25 procedimientos
- V. Académica: 30 procedimientos
- V. Programas: 15 procedimientos

Cargas nuevo archivo en Rectoría con 12 procedimientos:

Estado final:
- Rectoría: 12 procedimientos (REEMPLAZADOS)
- V. Administrativa: 25 procedimientos (SIN CAMBIOS)
- V. Académica: 30 procedimientos (SIN CAMBIOS)
- V. Programas: 15 procedimientos (SIN CAMBIOS)
```

---

## 📊 Estados Válidos

Copia exactamente uno de estos estados en tu Excel:

- `Pendiente` (0%)
- `En Elaboración` (20%)
- `En revisión` (40%)
- `Pendiente Ajustes` (60%)
- `Ajustado` (70%)
- `Aprobado` (80%)
- `En el sistema` (100%)

---

## 📁 Formatos Soportados

- ✅ `.xlsx` (Excel moderno)
- ✅ `.xls` (Excel antiguo)
- ✅ `.csv` (Valores separados por comas)

---

## 🎯 Flujo de Trabajo Recomendado

### Primera Vez:
1. Cada sistema prepara su propio archivo Excel
2. Cada responsable accede al panel admin
3. Carga su archivo en la tarjeta correspondiente
4. Verifica en el dashboard que los datos se vean correctamente

### Actualizaciones Periódicas:
1. Cada sistema actualiza su archivo Excel
2. Accede al panel admin
3. Carga el archivo actualizado
4. Los datos anteriores de ese sistema se reemplazan automáticamente

---

## ✅ Ventajas del Nuevo Sistema

✨ **Independencia**: Cada sistema maneja sus datos por separado
✨ **Simplicidad**: No necesitas incluir la columna "Sistema" en el Excel
✨ **Seguridad**: Al actualizar un sistema, no afectas los datos de otros
✨ **Claridad**: Sabes exactamente qué datos estás cargando
✨ **Limpieza**: Los espacios extra se eliminan automáticamente

---

## 🛠️ Solución de Problemas

### ❌ "No se encontraron procedimientos"
**Causa**: El archivo está vacío o no se detectaron las columnas principales
**Solución**: Verifica que al menos tengas estas columnas:
- `NOMBRE PROCEDIMIENTO` o `NOMBRE`
- `ESTADO GENERAL` o `ESTADO`

### ❌ "Error al procesar el archivo"
**Causa**: Formato de archivo no válido
**Solución**: Guarda el archivo como .xlsx desde Excel

### ❌ "Los datos no aparecen en el dashboard"
**Causa**: No hiciste clic en "Confirmar" o no volviste al dashboard
**Solución**: 
1. Haz clic en "Confirmar Importación"
2. Espera el mensaje de éxito
3. Haz clic en "← Volver al Dashboard" (botón en el header)

---

## 📝 Plantilla de Excel

### Ejemplo para Rectoría (Con el formato exacto de tus bases):

| N ID | SISTEMA | SUBSISTEMA | PROCESO | GESTOR FUNCIONAL PROCESO | AREA LÍDER | N° | TIPO | NOMBRE PROCEDIMIENTO | SEGUIMIENTO | RESPONSABLE CP | ESTADO GENERAL |
|------|---------|------------|---------|--------------------------|------------|----|------|----------------------|-------------|-----------------|----------------|
| 1 | Rectoria | Planeación y Desarrollo | Modelo de Gestión del Servicio | Director de Planeación y Desarrollo | Planeación y Desarrollo | 1 | Procedimiento | Gestión Fichas Técnicas | | Ricardo Alvarado | En revisión |
| 2 | Rectoria | Planeación y Desarrollo | Modelo de Gestión del Servicio | Director de Planeación y Desarrollo | Planeación y Desarrollo | 2 | Procedimiento | Gestión Medición | | Ricardo Alvarado | En revisión |

**Nota**: Puedes incluir TODAS las columnas de tu base de datos. El sistema detectará automáticamente las importantes e ignorará las demás. La columna SISTEMA se asigna automáticamente según la tarjeta donde cargues.

---

## 🎓 ¡Listo!

Ahora cada sistema puede gestionar sus datos de forma **independiente** y **segura**.

**¿Preguntas?** Contacta al administrador del sistema.

---

*Actualizado: Febrero 2026 - Versión 2.0*
