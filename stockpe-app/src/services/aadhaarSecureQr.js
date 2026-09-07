import { Buffer } from "buffer";
import forge from "node-forge";
import { inflate } from "pako";

// UIDAI rotates Secure QR signing keys. These DER SPKI keys are kept as an
// offline trust bundle; a QR is accepted only when one key verifies its
// SHA-256/RSA PKCS#1 v1.5 signature.
const UIDAI_PUBLIC_KEYS = [
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh1+zYnvbcEm0Yz73s5u42odpUJMr9wv5bVw7sOE5nFNbrB+U++5I0f8cL2HoHnJOkwvLZzrD0jG/vxAKi6vii/gjEzUEgrkdIHxMP3D6GJs0MSQHiEXvIGOwPIH3BLtBOc3m28NVNT6Q9iq0gUwuxnlhV38UdNhCllqNYhWmAMPJkImgaKrRZvY2pWNs6gd+PlAF/9SO69x3+1meA8kPk2ZvQanZlx9tfaExeOe9or3NQiKy2+UbtXrpcoAfYbbWi1OUzXi5bJdhbGp239c1fX6UKyUM5IUMY+m3I7wu2WQ7lmeO2n/vwzQz/PKHXPWYu3bydWMLdCi07vOQBqzCKwIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv1DSK9/qrW8RX1vDZMsE8xiiyJlj+6xxDtu+nSZDW9C/iajSqJ2QgLvRgweTw4suzzxZQseOE+kbqlbesNHc0lQjt9T+CGYrUTCbMI/a3zZbr3vPxz3VlN7iqr8U6ISUN53x+6qAc4Z/Pc66IqJA6zXBPKFZiHHMmi00eM14HgNWrLEkYHE5geBmBgEevznskS4Q+sJVX+4seJ/zadc35O4G6gvWZatlsB5STGSdes4TqF1k0FV4a0CF7vAzpUA4EtQohl6dnKWpfWYAJUxbSrH1OCLFBn1ABe9Yw5iZkIMFYauhyFzP16XCiG91TPoORIJ8ssIR9uf21o6rD82OJwIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmMIJKj28JcTN1B72p2/pgzDCoguhs/rbIXgN/ybNNh0NVOrZV2KllrmT5VOYlMrABpvIp7JU/n6hma3/O14n7nvngJ/y3colh8rk7msDwVAO7ZuVD+GCzfaYPLLkUS+wqH7M7FOHIn/pyJo1Rkxm98lO3dyox5RuLG2Uqm7JfVIomm0t7QKJoM5rf8JNvPXdwsxN89eWlT2Bf7BF//G3FKiF7ZHfvIyyqte/3orRRG/M80QqLrDP1RIeOa53ZTgILXcyQOb2yZOqNH3iN2uSKRsusNO17To5FOb2J9Hd5wIMuDv3zw4MWTrKAWuTYon90QSeGRKv1d5AQNRt0x5dSwIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv0HjbFpvu/kR+gTI2+svGNmW4eZHhTVBG/N+byaq3GH0SDM+jO5RW4BbXNzaSKc0I5mIyN1vQf2KmNV/3Xai6MokiiZrBRfM8a497zCMteHTAzSP1L0DmohUuBQh/s1hfqRIIWpfEu7noW2G8toK0ZOQR1E0FtinWNtqEeuxlNEKgfxkN4/vRzgvGFw+PPcoG5uMdcd7/DjDE1i20zmT+55DgIBrneCwrW7nIM0Md3BPOTV8iBwzjdVcdDHhMtSpi9UKUHw80sDRZp7ygB4Z0QmhSxCMCg9g7KPHYY+PVRC2sFreZBC6rtmIL+HMUPciRCCqMZLx3f6xRSD97lZr/wIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAonIsDl8t5bpwftk/A27CsfC5VZMjkPrMDwvL8gyAoVwIi0iGhmty6yWrC/VaL+Brae29XMg7dMdwnbIUHmwHxovN+FnT2vfz/O0kHQcgVdwVSIR0tFwsmC+pVKpSqm//skgYYcZQhdhLZBWOn0PZ81ymm0jOkwBSIQKkyuCTv/1HSwjTLR0EBvaH9+Vb0iaiOEv1ikHDhMOXTxx8URWBnJJt463z7LuZBMSG8fXVMDl3vqY1hDZzKbXBaK/clRIXMff0jUOvfPMfabHju+eUnceosQwL3eurq96+oHahz4FmrfBqikHe3xQ7/4NdvSvVuwth0kcsI0ptRBG8m1NglQIDAQAB",
];

export class AadhaarQrError extends Error {}

function decimalToBytes(value) {
    if (!/^\d{100,12000}$/.test(value)) {
        throw new AadhaarQrError("This is not an Aadhaar Secure QR code.");
    }

    let hex = BigInt(value).toString(16);
    if (hex.length % 2) hex = `0${hex}`;
    return Uint8Array.from(Buffer.from(hex, "hex"));
}

function spkiToPem(spki) {
    const lines = spki.match(/.{1,64}/g).join("\n");
    return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

function hasValidSignature(data, signature) {
    const binaryData = Buffer.from(data).toString("binary");
    const binarySignature = Buffer.from(signature).toString("binary");

    return UIDAI_PUBLIC_KEYS.some((spki) => {
        try {
            const digest = forge.md.sha256.create();
            digest.update(binaryData, "raw");
            return forge.pki
                .publicKeyFromPem(spkiToPem(spki))
                .verify(digest.digest().bytes(), binarySignature);
        } catch (_error) {
            return false;
        }
    });
}

function decodeFields(signedData) {
    const fields = [];
    let start = 0;

    for (let index = 0; index < signedData.length && fields.length < 18; index += 1) {
        if (signedData[index] === 255) {
            fields.push(Buffer.from(signedData.slice(start, index)).toString("utf8"));
            start = index + 1;
        }
    }

    const offset = /^V\d+$/.test(fields[0]) ? 1 : 0;
    const referenceId = fields[offset + 1]?.trim();
    const name = fields[offset + 2]?.trim();
    const dob = fields[offset + 3]?.trim();

    if (!/^\d{4,}$/.test(referenceId) || !name || !/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dob)) {
        throw new AadhaarQrError("This Aadhaar Secure QR format is not supported.");
    }

    return {
        aadhaarLastFour: referenceId.slice(0, 4),
        name,
        dateOfBirth: dob.replaceAll("-", "/"),
    };
}

export async function verifyAndParseAadhaarSecureQr(rawPayload) {
    try {
        const decompressed = inflate(decimalToBytes(rawPayload.trim()));
        if (decompressed.length <= 256) {
            throw new AadhaarQrError("This Aadhaar Secure QR code is incomplete.");
        }

        const signedData = decompressed.slice(0, -256);
        const signature = decompressed.slice(-256);
        if (!hasValidSignature(signedData, signature)) {
            throw new AadhaarQrError("This Aadhaar QR could not be verified.");
        }

        return decodeFields(signedData);
    } catch (error) {
        if (error instanceof AadhaarQrError) throw error;
        throw new AadhaarQrError("This Aadhaar Secure QR code is invalid.");
    }
}
