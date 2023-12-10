import { encrypt, decrypt } from 'ganxing';

const SecretKey = process.env.SecretKey;
const SecretIV = process.env.SecretIV;
// AES-GCM(256)对称加密
export const Encrypt = (txt: string) => {
  return SecretKey && SecretIV && encrypt(txt, SecretKey, SecretIV); // 对数据进行加密
};

// AES-GCM(256)对称解密
export const Decrypt = (txt: string) => {
  return SecretKey && SecretIV && decrypt(txt, SecretKey, SecretIV); // 对数据进行加密
};
