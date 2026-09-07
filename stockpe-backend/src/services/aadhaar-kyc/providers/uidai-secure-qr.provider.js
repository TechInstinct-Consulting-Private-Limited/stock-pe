const crypto = require("crypto");
const zlib = require("zlib");

const UIDAI_PUBLIC_KEYS = [
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh1+zYnvbcEm0Yz73s5u42odpUJMr9wv5bVw7sOE5nFNbrB+U++5I0f8cL2HoHnJOkwvLZzrD0jG/vxAKi6vii/gjEzUEgrkdIHxMP3D6GJs0MSQHiEXvIGOwPIH3BLtBOc3m28NVNT6Q9iq0gUwuxnlhV38UdNhCllqNYhWmAMPJkImgaKrRZvY2pWNs6gd+PlAF/9SO69x3+1meA8kPk2ZvQanZlx9tfaExeOe9or3NQiKy2+UbtXrpcoAfYbbWi1OUzXi5bJdhbGp239c1fX6UKyUM5IUMY+m3I7wu2WQ7lmeO2n/vwzQz/PKHXPWYu3bydWMLdCi07vOQBqzCKwIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv1DSK9/qrW8RX1vDZMsE8xiiyJlj+6xxDtu+nSZDW9C/iajSqJ2QgLvRgweTw4suzzxZQseOE+kbqlbesNHc0lQjt9T+CGYrUTCbMI/a3zZbr3vPxz3VlN7iqr8U6ISUN53x+6qAc4Z/Pc66IqJA6zXBPKFZiHHMmi00eM14HgNWrLEkYHE5geBmBgEevznskS4Q+sJVX+4seJ/zadc35O4G6gvWZatlsB5STGSdes4TqF1k0FV4a0CF7vAzpUA4EtQohl6dnKWpfWYAJUxbSrH1OCLFBn1ABe9Yw5iZkIMFYauhyFzP16XCiG91TPoORIJ8ssIR9uf21o6rD82OJwIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmMIJKj28JcTN1B72p2/pgzDCoguhs/rbIXgN/ybNNh0NVOrZV2KllrmT5VOYlMrABpvIp7JU/n6hma3/O14n7nvngJ/y3colh8rk7msDwVAO7ZuVD+GCzfaYPLLkUS+wqH7M7FOHIn/pyJo1Rkxm98lO3dyox5RuLG2Uqm7JfVIomm0t7QKJoM5rf8JNvPXdwsxN89eWlT2Bf7BF//G3FKiF7ZHfvIyyqte/3orRRG/M80QqLrDP1RIeOa53ZTgILXcyQOb2yZOqNH3iN2uSKRsusNO17To5FOb2J9Hd5wIMuDv3zw4MWTrKAWuTYon90QSeGRKv1d5AQNRt0x5dSwIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv0HjbFpvu/kR+gTI2+svGNmW4eZHhTVBG/N+byaq3GH0SDM+jO5RW4BbXNzaSKc0I5mIyN1vQf2KmNV/3Xai6MokiiZrBRfM8a497zCMteHTAzSP1L0DmohUuBQh/s1hfqRIIWpfEu7noW2G8toK0ZOQR1E0FtinWNtqEeuxlNEKgfxkN4/vRzgvGFw+PPcoG5uMdcd7/DjDE1i20zmT+55DgIBrneCwrW7nIM0Md3BPOTV8iBwzjdVcdDHhMtSpi9UKUHw80sDRZp7ygB4Z0QmhSxCMCg9g7KPHYY+PVRC2sFreZBC6rtmIL+HMUPciRCCqMZLx3f6xRSD97lZr/wIDAQAB",
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAonIsDl8t5bpwftk/A27CsfC5VZMjkPrMDwvL8gyAoVwIi0iGhmty6yWrC/VaL+Brae29XMg7dMdwnbIUHmwHxovN+FnT2vfz/O0kHQcgVdwVSIR0tFwsmC+pVKpSqm//skgYYcZQhdhLZBWOn0PZ81ymm0jOkwBSIQKkyuCTv/1HSwjTLR0EBvaH9+Vb0iaiOEv1ikHDhMOXTxx8URWBnJJt463z7LuZBMSG8fXVMDl3vqY1hDZzKbXBaK/clRIXMff0jUOvfPMfabHju+eUnceosQwL3eurq96+oHahz4FmrfBqikHe3xQ7/4NdvSvVuwth0kcsI0ptRBG8m1NglQIDAQAB",
];

function decimalToBuffer(payload) {
    if (typeof payload !== "string" || !/^\d{100,12000}$/.test(payload)) throw new Error("UNSUPPORTED_FORMAT");
    let hex = BigInt(payload).toString(16);
    if (hex.length % 2) hex = `0${hex}`;
    return Buffer.from(hex, "hex");
}

function decodeFields(data) {
    const fields = [];
    let start = 0;
    for (let index = 0; index < data.length && fields.length < 18; index += 1) {
        if (data[index] === 255) {
            fields.push(data.subarray(start, index).toString("utf8"));
            start = index + 1;
        }
    }
    const offset = /^V\d+$/.test(fields[0]) ? 1 : 0;
    const referenceId = fields[offset + 1]?.trim();
    const name = fields[offset + 2]?.trim();
    const dateOfBirth = fields[offset + 3]?.trim();
    if (!/^\d{4,}$/.test(referenceId) || !name || !/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateOfBirth)) throw new Error("UNSUPPORTED_FORMAT");
    return { aadhaarLastFour: referenceId.slice(0, 4), name, dateOfBirth: dateOfBirth.replaceAll("-", "/") };
}

function parseAndVerify(payload) {
    const decoded = zlib.inflateSync(decimalToBuffer(payload), { maxOutputLength: 16384 });
    if (decoded.length <= 256) throw new Error("INVALID_SIGNATURE");
    const signedData = decoded.subarray(0, -256);
    const signature = decoded.subarray(-256);
    const verified = UIDAI_PUBLIC_KEYS.some((spki) => {
        try {
            return crypto.verify("RSA-SHA256", signedData, { key: Buffer.from(spki, "base64"), format: "der", type: "spki", padding: crypto.constants.RSA_PKCS1_PADDING }, signature);
        } catch (_error) {
            return false;
        }
    });
    if (!verified) throw new Error("INVALID_SIGNATURE");
    return decodeFields(signedData);
}

function createUidaiSecureQrProvider() {
    return { name: "uidai_secure_qr", verify: ({ payload }) => parseAndVerify(payload) };
}

module.exports = { createUidaiSecureQrProvider };
