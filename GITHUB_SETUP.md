# 🚀 Guía para Conectar el Dashboard con GitHub

## Paso 1: Instalar Git (Si no lo tienes)

### Opción A: Descargar Git para Windows
1. Ve a: https://git-scm.com/download/win
2. Descarga el instalador
3. Ejecuta el instalador con las opciones por defecto
4. Reinicia tu terminal/PowerShell

### Opción B: Instalar con winget (Windows 11/10)
```powershell
winget install --id Git.Git -e --source winget
```

### Verificar instalación
```powershell
git --version
```

---

## Paso 2: Configurar Git (Primera vez)

Abre PowerShell o CMD y ejecuta:

```powershell
# Configurar tu nombre
git config --global user.name "Tu Nombre"

# Configurar tu email (usa el mismo de GitHub)
git config --global user.email "tu-email@ejemplo.com"
```

---

## Paso 3: Inicializar Repositorio Local

Navega a la carpeta del proyecto y ejecuta:

```powershell
# Ir a la carpeta del proyecto
cd C:\Users\ralvaradoa\.gemini\antigravity\scratch\dashboard-universidad-central

# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Dashboard Universidad Central v1.0"
```

---

## Paso 4: Crear Repositorio en GitHub

### Opción A: Desde la Web (Recomendado)

1. **Ve a GitHub**: https://github.com
2. **Inicia sesión** (o crea una cuenta si no tienes)
3. **Clic en el botón "+" arriba a la derecha** → "New repository"
4. **Configuración del repositorio**:
   - **Repository name**: `dashboard-universidad-central`
   - **Description**: `Dashboard profesional para gestión de procesos - Universidad Central`
   - **Visibilidad**: 
     - ✅ **Private** (recomendado para datos institucionales)
     - ⚠️ Public (solo si quieres que sea público)
   - **NO marques** "Initialize this repository with a README"
5. **Clic en "Create repository"**

### Opción B: Desde GitHub CLI (Si tienes gh instalado)

```powershell
gh repo create dashboard-universidad-central --private --source=. --remote=origin --push
```

---

## Paso 5: Conectar Repositorio Local con GitHub

Después de crear el repositorio en GitHub, ejecuta estos comandos:

```powershell
# Agregar el repositorio remoto (reemplaza TU-USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU-USUARIO/dashboard-universidad-central.git

# Cambiar la rama principal a 'main' (estándar actual)
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

**Ejemplo con usuario real:**
```powershell
git remote add origin https://github.com/ralvaradoa/dashboard-universidad-central.git
git branch -M main
git push -u origin main
```

---

## Paso 6: Autenticación con GitHub

Cuando hagas `git push`, GitHub te pedirá autenticación:

### Opción A: Personal Access Token (Recomendado)

1. **Ir a GitHub** → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)**
3. **Configuración**:
   - Note: `Dashboard Universidad Central`
   - Expiration: `90 days` (o lo que prefieras)
   - Scopes: Marca `repo` (acceso completo a repositorios)
4. **Generar y copiar el token** (¡guárdalo en un lugar seguro!)
5. **Cuando Git pida contraseña**, pega el token (no tu contraseña de GitHub)

### Opción B: GitHub CLI (Más fácil)

```powershell
# Instalar GitHub CLI
winget install --id GitHub.cli

# Autenticarse
gh auth login
```

---

## Paso 7: Verificar que Todo Funciona

```powershell
# Ver el estado del repositorio
git status

# Ver los commits
git log --oneline

# Ver los remotos configurados
git remote -v
```

---

## 🔄 Comandos Git para Uso Diario

### Guardar Cambios

```powershell
# Ver qué archivos cambiaron
git status

# Agregar archivos específicos
git add index.html
git add js/data.js

# O agregar todos los cambios
git add .

# Hacer commit con mensaje descriptivo
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

### Ejemplo de Flujo Completo

```powershell
# 1. Modificas archivos en tu editor
# 2. Guardas los cambios

# 3. Ver qué cambió
git status

# 4. Agregar cambios
git add .

# 5. Commit con mensaje
git commit -m "Agregada funcionalidad de exportación PDF"

# 6. Subir a GitHub
git push
```

---

## 📋 Comandos Útiles

```powershell
# Ver historial de commits
git log

# Ver historial resumido
git log --oneline --graph

# Ver diferencias antes de commit
git diff

# Deshacer cambios en un archivo (antes de commit)
git checkout -- archivo.html

# Ver ramas
git branch

# Crear nueva rama
git checkout -b nueva-funcionalidad

# Cambiar de rama
git checkout main

# Fusionar rama
git merge nueva-funcionalidad
```

---

## 🌐 Acceder a tu Repositorio en GitHub

Una vez subido, tu dashboard estará disponible en:

```
https://github.com/TU-USUARIO/dashboard-universidad-central
```

---

## 🚀 Bonus: GitHub Pages (Hosting Gratuito)

Puedes publicar tu dashboard gratis con GitHub Pages:

### Opción 1: Desde la Web

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: `Deploy from a branch`
4. Branch: `main` → folder: `/ (root)`
5. Save

Tu dashboard estará en:
```
https://TU-USUARIO.github.io/dashboard-universidad-central
```

### Opción 2: Desde Comandos

```powershell
# Crear rama gh-pages
git checkout -b gh-pages

# Subir a GitHub
git push -u origin gh-pages

# Volver a main
git checkout main
```

Luego activa GitHub Pages en Settings → Pages → Branch: `gh-pages`

---

## ⚠️ Consideraciones de Seguridad

### Si el repositorio es PRIVADO:
✅ Puedes subir todo sin problemas

### Si el repositorio es PÚBLICO:
⚠️ **NO subas**:
- Credenciales reales de administrador
- Datos sensibles de la universidad
- Información confidencial

**Antes de hacer público**, cambia en `js/admin.js`:
```javascript
// Eliminar o cambiar estas líneas
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};
```

Por un mensaje como:
```javascript
// Las credenciales deben configurarse en el backend
// Este es solo un ejemplo de desarrollo
```

---

## 📝 Archivo README.md para GitHub

Ya tienes un `README.md` completo en el proyecto que se mostrará automáticamente en GitHub.

---

## 🎯 Resumen de Comandos Rápidos

```powershell
# Setup inicial (una sola vez)
cd C:\Users\ralvaradoa\.gemini\antigravity\scratch\dashboard-universidad-central
git init
git add .
git commit -m "Initial commit: Dashboard Universidad Central v1.0"
git remote add origin https://github.com/TU-USUARIO/dashboard-universidad-central.git
git branch -M main
git push -u origin main

# Uso diario (cada vez que hagas cambios)
git add .
git commit -m "Descripción de cambios"
git push
```

---

## 🆘 Solución de Problemas

### Error: "git no se reconoce"
**Solución**: Instala Git (ver Paso 1)

### Error: "Permission denied"
**Solución**: Configura tu Personal Access Token (ver Paso 6)

### Error: "Repository not found"
**Solución**: Verifica que el repositorio existe en GitHub y que la URL es correcta

### Error: "Updates were rejected"
**Solución**: 
```powershell
git pull origin main --rebase
git push
```

---

## 📞 Próximos Pasos

Después de conectar con GitHub:

1. ✅ Haz commits regulares de tus cambios
2. ✅ Usa mensajes descriptivos en los commits
3. ✅ Considera usar ramas para nuevas funcionalidades
4. ✅ Documenta cambios importantes en el README
5. ✅ Configura GitHub Pages si quieres hosting gratuito

---

## 🔗 Links Útiles

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com
- **GitHub Pages**: https://pages.github.com
- **Markdown Guide**: https://www.markdownguide.org

---

**¡Tu dashboard está listo para GitHub!** 🎉

*Si necesitas ayuda con algún paso específico, avísame.*
