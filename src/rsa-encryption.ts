import { constants, generateKeyPair, privateDecrypt, publicEncrypt, RSAKeyPairOptions, sign, verify } from "crypto";
import { GenerateOption, Pem } from "./interfaces";

export class RSAEncryption {

  generateKey(options?: GenerateOption): Promise<Pem> {
    const modulusLength = options?.bitLength ? options.bitLength : 2048;
    const passphrase = options?.passphrase ? options.passphrase : '';
    const opt: RSAKeyPairOptions<"pem", "pem"> = {
      modulusLength,
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase,
      },
      publicKeyEncoding: {
        format: 'pem',
        type: 'spki',
      },
    }
    return new Promise<Pem>((resolve, reject) => {
      generateKeyPair('rsa', opt, (err, publicKey, privateKey) => {
        if (err) reject(err)
        resolve({ publicKey, privateKey });
      });
    });
  }

  encrypt(publicKey: string | Buffer, data: string): string {
    const encrypted = publicEncrypt(
      {
        key: publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "SHA256"
      },
      Buffer.isBuffer(data) ? data : Buffer.from(data)
    );
    return encrypted.toString('base64');
  }

  decrypt(privateKey: string | Buffer, encrypted: string, passphrase?: string): string {
    const decrypted = privateDecrypt(
      {
        key: privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "SHA256",
        passphrase: passphrase ? passphrase : ''
      },
      Buffer.from(encrypted, 'base64')
    );
    return decrypted.toString('utf-8');
  }

  signature(privateKey: string | Buffer, verifiableData: string | Buffer, passphrase?: string): string {
    const signature = sign('SHA512', Buffer.isBuffer(verifiableData) ? verifiableData : Buffer.from(verifiableData), {
      key: privateKey.toString(),
      passphrase: passphrase ? passphrase : '',
      padding: constants.RSA_PKCS1_PSS_PADDING,
    });
    return signature.toString('base64');
  }

  isVerified(publicKey: string, signature: string, verifiableData: string | Buffer): boolean {
    const isVerified = verify('SHA512', Buffer.isBuffer(verifiableData) ? verifiableData : Buffer.from(verifiableData), {
      key: publicKey,
      padding: constants.RSA_PKCS1_PSS_PADDING,
    }, Buffer.from(signature, 'base64'));
    return isVerified;
  }

}