export interface AuthResponse {
    /** JWT de corta duración; se guarda solo en memoria. */
    accessToken: string;
    tokenType: string;
    /** Segundos de validez del access token. */
    expiresIn: number;
    id: number;
    nombre: string;
    apellido: string;
    role: string;
    clienteId: number | null;
    nutricionistaId: number | null;
}
