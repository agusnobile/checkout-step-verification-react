import { UserData } from './user';

export interface FormData extends UserData {
  captchaVerified?: boolean;
}
