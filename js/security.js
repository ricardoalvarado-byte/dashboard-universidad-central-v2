/**
 * Universidad Central - Security Shield V2.0
 * Este script implementa medidas de disuasión contra la copia de código y acceso no autorizado.
 */

(function () {
    'use strict';

    // CÓDIGO DE ACCESO MAESTRO (Cambiar según necesidad)
    const MASTER_ACCESS_CODE = '2026';

    // 1. GUARDIÁN DE ACCESO (GATEKEEPER)
    function initAccessGuard() {
        const guard = document.getElementById('accessGuard');
        const input = document.getElementById('accessCode');
        const error = document.getElementById('accessError');

        if (!guard || !input) return;

        // Verificar si ya accedió en esta sesión
        if (sessionStorage.getItem('uc_dashboard_unlocked') === 'true') {
            guard.style.display = 'none';
            return;
        }

        input.focus();

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.length === 4) {
                if (val === MASTER_ACCESS_CODE) {
                    unlockDashboard(guard);
                } else {
                    showAccessError(input, error);
                }
            }
        });
    }

    function unlockDashboard(guard) {
        sessionStorage.setItem('uc_dashboard_unlocked', 'true');
        guard.style.opacity = '0';
        setTimeout(() => {
            guard.style.display = 'none';
        }, 500);
    }

    function showAccessError(input, error) {
        error.style.opacity = '1';
        input.style.borderColor = '#ef4444';
        input.style.animation = 'shake 0.5s';

        setTimeout(() => {
            input.value = '';
            input.style.borderColor = 'rgba(255,255,255,0.1)';
            input.style.animation = '';
            error.style.opacity = '0';
        }, 1500);
    }

    // 2. DESHABILITAR CLICK DERECHO
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // 3. DESHABILITAR ATAJOS DE TECLADO (F12, Ctrl+Shift+I, Ctrl+U, etc.)
    document.addEventListener('keydown', function (e) {
        // Bloquear combinaciones comunes de inspección
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
            (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) // Ctrl+U/S
        ) {
            preventAction(e);
        }
    });

    function preventAction(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 4. DETECCIÓN DE HERRAMIENTAS DE DESARROLLO
    setInterval(() => {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
            console.clear();
            console.log('%c¡SISTEMA PROTEGIDO!', 'color: red; font-size: 30px; font-weight: bold;');
        }
    }, 1000);

    // 5. EVITAR SELECCIÓN Y ARRASTRE
    document.addEventListener('dragstart', (e) => e.preventDefault());

    // 6. MARCA DE AGUA
    window.addEventListener('load', () => {
        initAccessGuard();

        const watermark = document.createElement('div');
        watermark.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 4rem; color: rgba(255, 255, 255, 0.02); pointer-events: none; z-index: 9999;
            white-space: nowrap; user-select: none; font-family: Inter, sans-serif; font-weight: 800;
        `;
        watermark.textContent = 'CONFIDENCIAL - UC';
        document.body.appendChild(watermark);
    });

    // Anti-Iframe
    if (window.self !== window.top) window.top.location = window.self.location;

})();
