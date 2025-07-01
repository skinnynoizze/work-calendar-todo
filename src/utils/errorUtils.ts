// Structured error logging utility
export interface ErrorLogContext {
  operation: string;
  userId?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

export function logError(error: unknown, context: ErrorLogContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Structured log object
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'error',
    operation: context.operation,
    message: errorMessage,
    stack: errorStack,
    ...context.metadata,
  };

  // En desarrollo: log completo a consola
  if (import.meta.env.DEV) {
    console.group(`🚨 Error in ${context.operation}`);
    console.error('Message:', errorMessage);
    if (errorStack) console.error('Stack:', errorStack);
    if (context.metadata) console.error('Context:', context.metadata);
    console.groupEnd();
  } else {
    // En producción: log estructurado para servicios de monitoring
    console.error(JSON.stringify(logData));
  }
}

export function createErrorMessage(operation: string, error: unknown): string {
  if (error instanceof Error) {
    // Mapear errores comunes de Supabase a mensajes amigables
    if (error.message.includes('JWT')) {
      return 'Sesión expirada. Por favor, vuelve a iniciar sesión.';
    }
    if (error.message.includes('network')) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    if (error.message.includes('permission')) {
      return 'No tienes permisos para realizar esta acción.';
    }
    return `Error en ${operation}: ${error.message}`;
  }
  return `Error desconocido en ${operation}`;
} 