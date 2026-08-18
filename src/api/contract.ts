/**
 * Карта REST /api/v1. Реализация фронта: src/api/client.ts.
 * Спека для Java: docs/backend/openapi.yaml
 */
export { paths as API } from "./paths";
export type {
  LoginRequest,
  LoginResponse,
  BookAppointmentRequest,
  BookAppointmentResponse,
  ApiErrorBody,
} from "./dto";
