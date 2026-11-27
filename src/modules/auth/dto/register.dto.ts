// Shape of the JSON body for POST /v1/auth/register
export class RegisterDto {
  name: string;
  email: string;
  password: string;
}
