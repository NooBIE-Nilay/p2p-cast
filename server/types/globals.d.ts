export {};

declare global {
  interface CustomJwtSessionClaims {
    id: string;
    externalId: string;
  }
}
