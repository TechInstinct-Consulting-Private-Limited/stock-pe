const { Buffer } = require("buffer");
const { XMLParser } = require("fast-xml-parser");
const { Inflate } = require("pako");

const MAX_DECIMAL_DIGITS = 12000;
const MAX_DECOMPRESSED_BYTES = 1024 * 1024;
const RSA_SIGNATURE_BYTES = 256;
const FIELD_DELIMITER = 0xff;
const JP2_SIGNATURE = Uint8Array.from([
    0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a,
]);
const J2K_SIGNATURE = Uint8Array.from([0xff, 0x4f, 0xff, 0x51]);

class AadhaarQrParseError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.name = "AadhaarQrParseError";
        this.code = code;
        if (cause) this.cause = cause;
    }
}

function clean(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizedResult(values) {
    const addressParts = [
        values.careOf,
        values.house,
        values.street,
        values.landmark,
        values.locality,
        values.vtc,
        values.postOffice,
        values.district,
        values.state,
        values.pinCode,
    ].filter(Boolean);

    return {
        format: values.format,
        version: values.version || null,
        verified: false,
        uid: values.uid || null,
        referenceId: values.referenceId || null,
        aadhaarLastFour:
            values.aadhaarLastFour || values.uid?.slice(-4) || null,
        name: values.name || "",
        dob: values.dob || "",
        gender: values.gender || "",
        careOf: values.careOf || "",
        house: values.house || "",
        street: values.street || "",
        locality: values.locality || "",
        landmark: values.landmark || "",
        vtc: values.vtc || "",
        postOffice: values.postOffice || "",
        district: values.district || "",
        state: values.state || "",
        pinCode: values.pinCode || "",
        address: addressParts.join(", "),
        emailPresent: values.emailPresent || false,
        mobilePresent: values.mobilePresent || false,
        photoBytes: values.photoBytes || null,
        photoMimeType: values.photoBytes ? "image/jp2" : null,
    };
}

function parseLegacyXml(rawData) {
    const tagStart = rawData.indexOf("<PrintLetterBarcodeData");
    if (tagStart < 0) {
        throw new AadhaarQrParseError(
            "UNSUPPORTED_FORMAT",
            "The legacy Aadhaar XML tag is missing."
        );
    }

    const tagEnd = rawData.indexOf("/>", tagStart);
    const closingTag = "</PrintLetterBarcodeData>";
    const closingEnd = rawData.indexOf(closingTag, tagStart);
    const end =
        tagEnd >= 0 ? tagEnd + 2 : closingEnd >= 0 ? closingEnd + closingTag.length : -1;
    if (end < 0) {
        throw new AadhaarQrParseError("MALFORMED_XML", "The Aadhaar XML is incomplete.");
    }

    try {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
            allowBooleanAttributes: false,
            processEntities: false,
        });
        const parsed = parser.parse(rawData.slice(tagStart, end));
        const attributes = parsed.PrintLetterBarcodeData;
        if (!attributes || typeof attributes !== "object") {
            throw new Error("PrintLetterBarcodeData is not an element");
        }

        return normalizedResult({
            format: "legacy",
            version: "XML",
            uid: clean(attributes.uid),
            name: clean(attributes.name),
            dob: clean(attributes.dob || attributes.yob),
            gender: clean(attributes.gender),
            careOf: clean(attributes.co),
            house: clean(attributes.house),
            street: clean(attributes.street),
            locality: clean(attributes.loc),
            landmark: clean(attributes.lm),
            vtc: clean(attributes.vtc),
            postOffice: clean(attributes.po),
            district: clean(attributes.dist),
            state: clean(attributes.state),
            pinCode: clean(attributes.pc),
        });
    } catch (error) {
        if (error instanceof AadhaarQrParseError) throw error;
        throw new AadhaarQrParseError(
            "MALFORMED_XML",
            "The legacy Aadhaar XML could not be parsed.",
            error
        );
    }
}

function decimalToBytes(value) {
    if (!new RegExp(`^\\d{100,${MAX_DECIMAL_DIGITS}}$`).test(value)) {
        throw new AadhaarQrParseError(
            "UNSUPPORTED_FORMAT",
            "The QR payload is not a supported Aadhaar format."
        );
    }

    try {
        let hex = BigInt(value).toString(16);
        if (hex.length % 2) hex = `0${hex}`;
        return Uint8Array.from(Buffer.from(hex, "hex"));
    } catch (error) {
        throw new AadhaarQrParseError(
            "INVALID_DECIMAL_PAYLOAD",
            "The Aadhaar decimal payload is malformed.",
            error
        );
    }
}

function decompressSecurePayload(compressed) {
    const chunks = [];
    let outputLength = 0;
    let exceededLimit = false;
    const inflater = new Inflate({ chunkSize: 16384 });

    inflater.onData = (chunk) => {
        outputLength += chunk.length;
        if (outputLength > MAX_DECOMPRESSED_BYTES) {
            exceededLimit = true;
            return;
        }
        chunks.push(chunk);
    };

    try {
        inflater.push(compressed, true);
    } catch (error) {
        throw new AadhaarQrParseError(
            "DECOMPRESSION_FAILED",
            "The Aadhaar Secure QR payload could not be decompressed.",
            error
        );
    }

    if (exceededLimit) {
        throw new AadhaarQrParseError(
            "PAYLOAD_TOO_LARGE",
            "The decompressed Aadhaar payload exceeds the safe size limit."
        );
    }
    if (inflater.err || !chunks.length) {
        throw new AadhaarQrParseError(
            "DECOMPRESSION_FAILED",
            "The Aadhaar Secure QR payload could not be decompressed."
        );
    }

    const output = new Uint8Array(outputLength);
    let offset = 0;
    for (const chunk of chunks) {
        output.set(chunk, offset);
        offset += chunk.length;
    }
    return output;
}

function startsWithAt(bytes, signature, offset) {
    if (offset + signature.length > bytes.length) return false;
    return signature.every((value, index) => bytes[offset + index] === value);
}

function findSignature(bytes, signature, fromIndex) {
    for (let index = fromIndex; index <= bytes.length - signature.length; index += 1) {
        if (startsWithAt(bytes, signature, index)) return index;
    }
    return -1;
}

function readUint32(bytes, offset) {
    return (
        bytes[offset] * 0x1000000 +
        (bytes[offset + 1] << 16) +
        (bytes[offset + 2] << 8) +
        bytes[offset + 3]
    );
}

function extractJp2(bytes, fromIndex) {
    const jp2Start = findSignature(bytes, JP2_SIGNATURE, fromIndex);
    if (jp2Start >= 0) {
        let cursor = jp2Start;
        let end = jp2Start;
        while (cursor + 8 <= bytes.length) {
            const boxLength = readUint32(bytes, cursor);
            if (boxLength < 8 || cursor + boxLength > bytes.length) break;
            cursor += boxLength;
            end = cursor;
        }
        return end > jp2Start ? bytes.slice(jp2Start, end) : null;
    }

    const codestreamStart = findSignature(bytes, J2K_SIGNATURE, fromIndex);
    if (codestreamStart >= 0) {
        for (let index = bytes.length - 2; index > codestreamStart; index -= 1) {
            if (bytes[index] === 0xff && bytes[index + 1] === 0xd9) {
                return bytes.slice(codestreamStart, index + 2);
            }
        }
    }
    return null;
}

function readDelimitedFields(bytes, expectedFields) {
    const fields = [];
    let start = 0;
    let binaryOffset = -1;

    for (let index = 0; index < bytes.length; index += 1) {
        if (bytes[index] !== FIELD_DELIMITER) continue;
        fields.push(Buffer.from(bytes.slice(start, index)).toString("utf8"));
        start = index + 1;
        if (fields.length === expectedFields) {
            binaryOffset = start;
            break;
        }
    }

    if (fields.length < expectedFields) {
        throw new AadhaarQrParseError(
            "INCOMPLETE_SECURE_PAYLOAD",
            "The Aadhaar Secure QR payload does not contain all required fields."
        );
    }
    return { fields: fields.map(clean), binaryOffset };
}

function parseSecurePayload(rawData) {
    const decompressed = decompressSecurePayload(decimalToBytes(rawData));
    if (decompressed.length <= RSA_SIGNATURE_BYTES) {
        throw new AadhaarQrParseError(
            "INCOMPLETE_SECURE_PAYLOAD",
            "The Aadhaar Secure QR payload is incomplete."
        );
    }

    // The signature is retained by the verification layer; this parser only
    // reads the signed content and must never mark it as authentic by itself.
    const signedData = decompressed.slice(0, -RSA_SIGNATURE_BYTES);
    const firstDelimiter = signedData.indexOf(FIELD_DELIMITER);
    const firstField =
        firstDelimiter >= 0
            ? clean(Buffer.from(signedData.slice(0, firstDelimiter)).toString("utf8"))
            : "";
    const hasVersionHeader = /^V\d+$/.test(firstField);
    const version = hasVersionHeader ? firstField : "V1";
    const { fields, binaryOffset } = readDelimitedFields(
        signedData,
        hasVersionHeader ? 17 : 16
    );
    const offset = hasVersionHeader ? 1 : 0;
    const presence = Number.parseInt(fields[offset], 10) || 0;

    // UIDAI V2 field order differs from the display-address order.
    const values = {
        format: version === "V1" ? "secure-v1" : "secure-v2",
        version,
        referenceId: fields[offset + 1],
        name: fields[offset + 2],
        dob: fields[offset + 3]?.replaceAll("-", "/"),
        gender: fields[offset + 4],
        careOf: fields[offset + 5],
        district: fields[offset + 6],
        landmark: fields[offset + 7],
        house: fields[offset + 8],
        locality: fields[offset + 9],
        pinCode: fields[offset + 10],
        postOffice: fields[offset + 11],
        state: fields[offset + 12],
        street: fields[offset + 13],
        subDistrict: fields[offset + 14],
        vtc: fields[offset + 15],
        emailPresent: (presence & 1) !== 0,
        mobilePresent: (presence & 2) !== 0,
        photoBytes: extractJp2(signedData, binaryOffset),
    };

    if (!values.referenceId || !values.name) {
        throw new AadhaarQrParseError(
            "INVALID_SECURE_FIELDS",
            "The Aadhaar Secure QR identity fields are missing."
        );
    }

    const result = normalizedResult(values);
    result.subDistrict = values.subDistrict || "";
    // React Native's standard Image component cannot render JPEG2000. Convert
    // photoBytes to PNG/JPEG with a native JP2 codec before displaying it.
    return result;
}

async function parseUniversalAadhaarQR(rawData) {
    if (typeof rawData !== "string" || !rawData.trim()) {
        throw new AadhaarQrParseError("EMPTY_PAYLOAD", "A QR payload is required.");
    }

    const value = rawData.trim();
    try {
        if (value.includes("<PrintLetterBarcodeData")) {
            return parseLegacyXml(value);
        }
        return parseSecurePayload(value);
    } catch (error) {
        if (error instanceof AadhaarQrParseError) throw error;
        throw new AadhaarQrParseError(
            "MALFORMED_PAYLOAD",
            "The Aadhaar QR payload could not be parsed.",
            error
        );
    }
}

module.exports = { AadhaarQrParseError, parseUniversalAadhaarQR };
