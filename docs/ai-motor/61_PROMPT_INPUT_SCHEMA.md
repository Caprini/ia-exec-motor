Este es el contrato formal del objeto de entrada para el **Motor de Ejecución**, diseñado bajo un esquema de arquitectura de datos estructurada para garantizar el determinismo en operaciones con IA:

1. Esquema del Objeto de Entrada

El objeto de entrada se define como un `InstructionRequest` y debe seguir la estructura técnica detallada a continuación:

**A. Campos Obligatorios (Anatomía del Prompt - G-02)**

• **role** (`string`): Define la identidad técnica y el contexto operativo de la IA (ej: "Arquitecto de Sistemas Cloud").

• **task** (`string`): La misión o tarea única y específica que debe realizar el motor.

• **specifications** (`array[string]`): Lista de detalles técnicos concretos, inclusiones, exclusiones y restricciones de la tarea.

• **acceptance_criteria** (`array[string]`): Criterios de calidad medibles que validan el éxito del resultado (preferiblemente en formato Gherkin).

• **output_format** (`string` | `object`): Definición rigurosa de la estructura de la respuesta (ej: "Markdown", "JSON", "Código funcional").

**B. Campos Opcionales / de Contexto (G-01)**

• **context_references** (`array[uri]`): Rutas explícitas a archivos de la "fuente de verdad" (esquemas SQL, documentación técnica o código canónico). [145, 147, G-01]

• **execution_config** (`object`):

    ◦ **strictMode** (`boolean`): Conmutador de rigor operativo. Por defecto `false`. [G-02]

    ◦ **priority** (`enum`): Nivel de precedencia de reglas (Team, Project, User).

1. Validaciones Estructurales y Lógicas
2. **Validación de Integridad (G-02):** El sistema rechaza cualquier objeto que no contenga los 5 campos obligatorios con valores no nulos y de tipo `string` o `array` según corresponda. [104, G-02]
3. **Validación de Anclaje (G-01):** Si se detecta una tarea de alta complejidad, el motor exige que `context_references` no sea un array vacío. [G-01]
4. **Relación con strictMode:**
  ◦ Si `strictMode: true`, las validaciones de los Quality Gates **G-01** y **G-02** pasan de severidad `WARNING` a `ERROR BLOQUEANTE`. [G-02]
   ◦ Se prohíbe la inferencia de datos faltantes; el motor debe abortar y solicitar los metadatos ausentes.
5. Ejemplos de Contrato

**Ejemplo JSON Válido (Cumple G-01 y G-02)**

```
{
  "role": "Ingeniero de Software Senior",
  "task": "Implementar un servicio de validación de OTP",
  "specifications": [
    "Usar tipado fuerte",
    "Excluir dependencias externas no autorizadas",
    "Seguir convenciones snake_case"
  ],
  "acceptance_criteria": [
    "El OTP debe tener exactamente 6 dígitos",
    "La vigencia debe ser de 5 minutos",
    "Debe incluir tests de regresión"
  ],
  "output_format": "Bloque de código TypeScript con documentación JSDoc",
  "context_references": [
    "file://.cursor/rules/agents.md",
    "file://context/database_schema.sql"
  ],
  "execution_config": {
    "strictMode": true
  }
}
```

**Ejemplo JSON Inválido (Falla G-02 y strictMode)**

```
{
  "role": "Dev",
  "task": "Crea una función",
  "specifications": [],
  "execution_config": {
    "strictMode": true
  }
}
```

**Motivo de invalidación:**

• Faltan campos obligatorios (`acceptance_criteria`, `output_format`).

• Bajo `strictMode: true`, las especificaciones vacías disparan el Gate de Determinismo Estructural (**G-02**), bloqueando la ejecución. [G-02]
