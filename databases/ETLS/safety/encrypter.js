import bcrypt from 'bcrypt';
export class Encrypter {
  static encrypt(pwd_to_encrypt) {
    return bcrypt.hashSync(pwd_to_encrypt, 10);
  }
  static checkPassword(pwd_to_check, pwd_encrypted) {
    return bcrypt.compareSync(pwd_to_check, pwd_encrypted);
  }
}
