# 00 — Roadmap v1

Este documento define la evolución formal del proyecto hasta v1.0.0. Todas las fases deben ejecutarse sin romper funcionalidad existente.

## Visión del Producto

**Cursor Project Bootstrapper** — Sistema de bootstrap profesional para proyectos gobernados de Vibecoding con Cursor IDE.

## Problema que resuelve

Crear un proyecto desde cero con gobernanza técnica, reglas de Cursor, estructura de directorios y convenciones predefinidas requiere tiempo y conocimiento disperso. El bootstrapper centraliza este proceso de forma determinista y repetible.

## Definición formal de v1.0.0

> Crear un proyecto profesional gobernado para vibecoding en menos de 10 minutos.

## Fases de madurez

### Fase 0 — Estado actual

- CLI con validación InstructionRequest, gates G-01 a G-13, reportes.
- Repo Validator v0: RG-01 a RG-05.
- Generación de GATE_REPORT.json y EXEC_REPORT.md.

### Fase 1 — Interactive Bootstrap (v0.3)

- Wizard interactivo como corazón del sistema.
- Guía paso a paso para generar un proyecto gobernado.
- Integración con la validación y reportes existentes.

### Fase 2 — Roadmap Generator (v0.5)

- Generador de roadmap a partir de contexto del proyecto.
- Alineación con fases de madurez definidas.

### Fase 3 — Governance Hardening (v0.8)

- Endurecimiento de reglas de gobernanza.
- Validaciones adicionales y controles de calidad.

### Fase 4 — Release v1.0.0

- Objetivo de éxito cumplido: proyecto gobernado en menos de 10 minutos.
- Estabilidad y documentación completas.

## Fuera de alcance v1.0.0

- Integración con sistemas externos (CI/CD, cloud).
- Telemetría firmada o auditoría automática de cambios MAJOR.
- Soporte multi-IDE más allá de Cursor.
- Cambios breaking en gates o repo-validator sin justificación MAJOR.

## Política SemVer interna

- **MAJOR**: cambios incompatibles, alcance ampliado significativamente.
- **MINOR**: nuevas funcionalidades compatibles con versiones anteriores.
- **PATCH**: correcciones y mejoras menores sin cambio de API.

Cualquier cambio fuera del alcance del roadmap requiere justificación MAJOR.

## Métrica de éxito v1.0.0

Un usuario sin contexto previo del proyecto puede ejecutar el bootstrapper y obtener un proyecto gobernado con estructura válida, reglas aplicadas y tests pasando en **menos de 10 minutos**.
