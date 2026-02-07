# Postura de Seguridad y Hardening - Universidad Central Dashboard

**Fecha:** 07 de Febrero de 2026
**Nivel de Criticidad:** ALTO

Este documento detalla las medidas de seguridad implementadas y, más importante aún, las **acciones requeridas en el servidor (Supabase)** para garantizar que la aplicación sea invulnerable a manipulaciones malintencionadas "por debajo".

---

## 1. Diagnóstico de Seguridad Frontend

### Lo que hemos hecho (Seguridad en el Cliente):
1.  **Ofuscación de Login:** La lógica de autenticación administrativa ha sido encapsulada en un módulo privado (`AuthModule`). Las variables críticas ya no están expuestas en el objeto global `window`, impidiendo ataques triviales desde la consola del navegador.
2.  **Prevención de XSS (Cross Site Scripting):** Hemos verificado que todos los datos provenientes de archivos Excel o bases de datos pasan por una función de saneamiento (`escapeHTML`) antes de ser renderizados en la tabla. Esto impide que un atacante inyecte scripts maliciosos a través de nombres de procedimientos manipulados.
3.  **Llaves Públicas:** La aplicación utiliza correctamente la `ANON_KEY` de Supabase. Esta llave es pública por diseño y segura de exponer *si y solo si* el backend está protegido.

### La Realidad del Frontend:
**IMPORTANTE:** En una aplicación web moderna (SPA / Static Site), **NADA** que esté en el código JavaScript es secreto. Un atacante motivado siempre podrá leer el código fuente.
*   **No se pueden esconder llaves maestras.**
*   **No se puede confiar en validaciones solo del lado del cliente.**

---

## 2. Seguridad en el Backend (Supabase) - ACCIÓN REQUERIDA

Para que "no la hackeen", debes implementar **Row Level Security (RLS)** en tu base de datos. Sin esto, cualquier persona con conocimientos básicos puede borrar tu base de datos usando la llave pública que está en el código.

### Instrucciones para Blindar la Base de Datos

Ve al **SQL Editor** de tu proyecto en Supabase y ejecuta el siguiente script. Esto activará la seguridad a nivel de fila:

```sql
-- 1. Activar RLS en la tabla principal
ALTER TABLE procedimientos ENABLE ROW LEVEL SECURITY;

-- 2. Crear Política de LECTURA (Pública)
-- Permite que cualquiera vea los datos (necesario para el dashboard público)
CREATE POLICY "Lectura pública de procedimientos"
ON procedimientos FOR SELECT
USING (true);

-- 3. Crear Política de ESCRITURA (Restringida)
-- Aquí definimos quién puede modificar. 
-- OPCIÓN A: Si usas Supabase Auth (Usuarios registrados)
-- CREATE POLICY "Solo admins pueden modificar"
-- ON procedimientos FOR ALL
-- USING (auth.role() = 'authenticated');

-- OPCIÓN B (Tu caso actual sin usuarios): 
-- Como no tienes sistema de usuarios en Supabase, la mejor protección es
-- NO PERMITIR escrituras públicas y realizar las cargas mediante un
-- Backend Function o usando la Service Role Key solo en un entorno seguro (no en el navegador).

-- Sin embargo, para permitir que TU dashboard admin funcione sin login de Supabase,
-- debes ser consciente de que la escritura sigue siendo vulnerable si no usas Supabase Auth.
-- RECOMENDACIÓN FUERTE: Implementar Supabase Auth.
```

### 🔴 Alerta Crítica sobre el Modelo Actual

Actualmente, tu panel administrativo (`admin.js`) usa la llave pública (`ANON_KEY`) para escribir/borrar datos.
*   Si activas RLS y bloqueas la escritura pública, **tu panel admin dejará de funcionar** (no podrá guardar).
*   Si dejas la escritura pública (`CREATE POLICY ... USING (true)`), **cualquiera puede borrar datos**.

**Solución Recomendada (Roadmap de Seguridad):**
1.  Activar **Supabase Auth** (Email/Password).
2.  Crear un usuario administrador en Supabase.
3.  Hacer login real en el dashboard (`supabase.auth.signInWithPassword`).
4.  Configurar RLS para que `INSERT / UPDATE / DELETE` solo sean permitidos a usuarios autenticados:
    ```sql
    CREATE POLICY "Solo autenticados modifican"
    ON procedimientos FOR ALL
    USING (auth.role() = 'authenticated');
    ```

---

## 3. Conclusión

La aplicación ha sido asegurada "por debajo" en el código fuente (ofuscación, saneamiento), pero la seguridad real depende de la configuración de tu base de datos.

**Estado Actual:**
*   Visualización Pública: **SEGURA** (XSS protegido).
*   Lógica Admin: **OFUSCADA** (Difícil de saltar para usuarios normales).
*   Base de Datos: **VULNERABLE** hasta que configures Supabase Auth y RLS.

Se recomienda proceder con la implementación de Supabase Auth en la siguiente fase de desarrollo.
