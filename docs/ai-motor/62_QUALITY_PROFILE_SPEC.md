Basado en la arquitectura técnica del motor y los principios de gobernanza extraídos de las fuentes, se definen los cuatro **Perfiles de Calidad** para el Motor de Ejecución de IA:

Matriz Comparativa de Perfiles de Calidad


| Característica            | **Exploratory** | **Standard** | **Strict**          | **Production**        |
| ------------------------- | --------------- | ------------ | ------------------- | --------------------- |
| **strictMode**            | false           | false        | **true**            | **true**              |
| **Severidad por defecto** | INFO            | WARNING      | **ERROR**           | **ERROR (Blocking)**  |
| **Auto-remediation**      | sí              | sí           | no (Auditoría G-05) | **no (Audit Reqd.)**  |
| **Requiere no-regresión** | no              | no           | sí (Gate G-11)      | **sí (Mandatorio)**   |
| **Logs estructurados**    | no              | no           | sí (Gate G-12)      | **sí (Mandatorio)**   |
| **Contexto obligatorio**  | no              | recomendado  | sí (Gate G-01)      | **sí (Fuentes URI)**  |
| **Permite inferencias**   | sí              | sí           | no (Pregunta G-02)  | **no (Determinista)** |


---

Descripción Técnica de los Perfiles

1. Exploratory (Exploración)

• **Propósito:** Prototipado rápido y descubrimiento de soluciones.

• **Operativa:** El motor prioriza la creatividad y la velocidad. Las violaciones de las reglas de proyecto (`.cursor/rules`) se registran solo como métricas de telemetría sin interrumpir el flujo. Se permite que la IA asuma información faltante (inferencias) para evitar fricción.

1. Standard (Desarrollo Base)

• **Propósito:** Construcción diaria de funcionalidades bajo estándares de equipo.

• **Operativa:** Se aplica la **Anatomía del Prompt** pero con flexibilidad. Las fallas en los Quality Gates generan advertencias (`WARNING`), instando al desarrollador a corregir, pero permitiendo la ejecución. Se permite la auto-remediación si el Agente detecta un patrón de error conocido [Cursor Rules, 48].

1. Strict (Refino y Calidad)

• **Propósito:** Fase de estabilización y corrección de bugs críticos [G-02, 124].

• **Operativa:** Activa el **Modo Estricto**. Cualquier instrucción que no referencie una fuente de verdad técnica (`G-01`) o carezca de criterios de aceptación (`G-02`) es rechazada inmediatamente. Se prohíbe la inferencia: si falta información, el motor invoca una **cláusula de clarificación** obligatoria.

1. Production (Entrega Final)

• **Propósito:** Código listo para despliegue y entornos de alta criticidad [156, G-13].

• **Operativa:** Es el nivel máximo de rigor determinista. Exige que el código incluya **logging estructurado** para observabilidad en el runtime externo [64, G-12] y supere una suite de **tests de no-regresión** (TDD) antes de permitir la persistencia en el repositorio [149, G-11]. La auditoría humana debe generar una métrica de cumplimiento verificable antes del cierre [G-05, 100].
