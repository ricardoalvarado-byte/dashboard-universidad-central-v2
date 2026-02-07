# Informe Técnico y Funcional: Dashboard de Gestión de Procesos - Universidad Central

**Fecha:** 07 de Febrero de 2026  
**Versión del Sistema:** 1.1.5  
**Autor:** Equipo de Desarrollo (Antigravity AI)

---

## 1. Resumen Ejecutivo

Este documento detalla la lógica interna, arquitectura y algoritmos de cálculo del sistema de Dashboard para la Gestión de Procesos Institucionales. El sistema permite la visualización centralizada de procedimientos, sincronización en la nube (Supabase) y operación offline mediante caché local.

## 2. Arquitectura de Datos

### 2.1. Flujo de Información
El sistema opera bajo un modelo **"Cloud-First con Respaldo Local"**:
1.  **Importación (Excel/CSV):** El usuario carga archivos. El sistema detecta automáticamente la estructura de columnas mediante algoritmos de "Fuerza Bruta Inteligente" (Nivel 1 a 3 de coincidencia).
2.  **Normalización:** Los datos crudos se limpian para estandarizar nombres de Sistemas (`Vicerrectoría Académica` vs `VA`) y Estados.
3.  **Deduplicación:** Antes de enviar a la nube, se filtran registros duplicados por ID para garantizar la integridad referencial.
4.  **Almacenamiento (Supabase):** Se realiza un `UPSERT` (Insertar o Actualizar) en la base de datos PostgreSQL.
5.  **Persistencia Local:** Se guarda una copia espejo en `localStorage` del navegador para acceso ultrarrápido y funcionamiento sin internet.

### 2.2. Determinación de "Última Actualización"
El indicador de fecha no muestra el momento de acceso del usuario, sino la **frescura real de los datos**:
*   El sistema escanea la columna `updated_at` de todos los registros descargados.
*   Selecciona el `timestamp` más reciente (`MAX(updated_at)`).
*   Esto garantiza que si los datos no han cambiado en la base de datos, la fecha mostrada corresponderá a la última modificación real.

---

## 3. Lógica de Cálculos (KPIs)

Los Indicadores Clave de Desempeño (KPIs) se calculan dinámicamente sobre el conjunto de datos filtrado.

### 3.1. Total Procedimientos
*   **Fórmula:** `Count(Registros Filtrados)`
*   **Descripción:** Conteo simple de los ítems visibles en la tabla actual según los filtros aplicados.

### 3.2. Completitud Global (Promedio Ponderado)
Este indicador mide el avance real del proyecto, no solo por cantidad de documentos, sino por su estado de madurez.

*   **Ponderación por Estado:**
    *   Pendiente: **0%**
    *   En Elaboración: **20%**
    *   En Revisión: **40%**
    *   Pendiente Ajustes: **60%**
    *   Ajustado: **70%**
    *   Aprobado: **80%**
    *   En el Sistema: **100%**

*   **Algoritmo:**
    $$ \text{Completitud} = \frac{\sum (\text{Avance}_i)}{\text{Total de Procedimientos}} $$
    Donde $\text{Avance}_i$ es el porcentaje asignado al estado del procedimiento $i$.

### 3.3. En Gestión (Activos)
Muestra la carga de trabajo actual, excluyendo lo que no ha empezado o lo que ya terminó.
*   **Lógica:** Conteo de procedimientos cuyo estado **NO** es "Pendiente" (0%) Y **NO** es "En el sistema" (100%).
*   **Objetivo:** Identificar el cuello de botella operativo real.

### 3.4. Mejor Área (Ranking de Eficiencia)
Determina qué área tiene el mejor desempeño relativo.
*   **Criterio:** Área con el mayor **Promedio de Avance Ponderado**.
*   **Restricción:** Solo se consideran áreas con al menos 3 procedimientos para evitar sesgos estadísticos (ej. un área con un solo procedimiento al 100% no debería ganar automáticamente).

---

## 4. Visualización Gráfica

### 4.1. Distribución por Estado (Dona)
*   **Tipo:** Doughnut Chart (Chart.js)
*   **Datos:** Agrupación (`GROUP BY`) de procedimientos por su Estado Normalizado.
*   **Visualización:**
    *   Etiquetas: Porcentaje relativo + Valor absoluto.
    *   Estilo: Etiquetas con fondo oscuro semitransparente para alto contraste (`#ffffff` sobre `rgba(0,0,0,0.5)`).

### 4.2. Avance por Área (Barras Apiladas)
Este gráfico fue rediseñado para evitar confusiones de promedios.
*   **Tipo:** Stacked Horizontal Bar Chart.
*   **Eje Y:** Top 10 Áreas con mayor volumen de procedimientos.
*   **Eje X:** Cantidad Total de Procedimientos.
*   **Series (Colores):** Cada segmento de la barra representa la cantidad exactas de procedimientos en cada estado (Rojo=Pendiente, Verde=Listo).
*   **Interacción:** Configurada con `intersect: true` y `axis: 'y'` para precisión exacta al pasar el puntero sobre segmentos específicos.

---

## 5. Lógica de Filtros Inteligentes

### 5.1. Cascada Sistema -> Subsistema
El filtro de Subsistemas es **dependiente del contexto**:
1.  Al seleccionar un Sistema (ej. "Rectoría"), el sistema dispara un evento.
2.  La función `updateSubsistemaOptions()` escanea solo los procedimientos pertenecientes a "Rectoría".
3.  Extrae los valores únicos de `subsistema` y reconstruye el selector `select`.
4.  Esto previene que el usuario seleccione combinaciones imposibles (ej. Sistema "Académica" con Subsistema de "Financiera").

### 5.2. Normalización de Entrada
El sistema es tolerante a fallos de entrada humana en el Excel. Reconoce automáticamente que:
*   `"V. Académica"` = `"Vicerrectoría Académica"`
*   `"VA"` = `"Vicerrectoría Académica"`
*   `"Académico"` = `"Vicerrectoría Académica"`

Esta lógica se aplica mediante expresiones regulares y normalización Unicode (`NFD`) para ignorar tildes y mayúsculas.

---

**Fin del Informe**
