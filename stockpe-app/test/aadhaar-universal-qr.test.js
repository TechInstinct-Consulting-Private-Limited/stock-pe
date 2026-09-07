const assert = require("node:assert/strict");
const { Buffer } = require("node:buffer");
const test = require("node:test");
const { deflate } = require("pako");

const {
    AadhaarQrParseError,
    parseUniversalAadhaarQR,
} = require("../src/services/aadhaarUniversalQr");

function bytesToDecimal(bytes) {
    return BigInt(`0x${Buffer.from(bytes).toString("hex")}`).toString(10);
}

test("normalizes legacy Aadhaar XML attributes", async () => {
    const result = await parseUniversalAadhaarQR(
        'prefix <PrintLetterBarcodeData uid="123412341234" name="TEST USER" gender="F" dob="01/01/2000" co="C/O TEST" vtc="PUNE" po="PUNE" dist="PUNE" state="MH" pc="411001"/> suffix'
    );

    assert.equal(result.format, "legacy");
    assert.equal(result.name, "TEST USER");
    assert.equal(result.aadhaarLastFour, "1234");
    assert.equal(result.verified, false);
});

test("parses versioned secure fields without treating them as verified", async () => {
    const fields = [
        "V2", "3", "123420260101", "TEST USER", "01-01-2000", "F",
        "C/O TEST", "DISTRICT", "LANDMARK", "HOUSE", "LOCALITY", "411001",
        "POST OFFICE", "STATE", "STREET", "SUBDISTRICT", "VTC",
    ];
    const signedData = Buffer.from(`${fields.join(String.fromCharCode(255))}${String.fromCharCode(255)}`, "latin1");
    const payload = Buffer.concat([signedData, Buffer.alloc(256)]);
    const result = await parseUniversalAadhaarQR(bytesToDecimal(deflate(payload)));

    assert.equal(result.format, "secure-v2");
    assert.equal(result.referenceId, "123420260101");
    assert.equal(result.emailPresent, true);
    assert.equal(result.mobilePresent, true);
    assert.equal(result.verified, false);
});

test("rejects malformed payloads with a stable parser error", async () => {
    await assert.rejects(
        parseUniversalAadhaarQR("12345"),
        (error) =>
            error instanceof AadhaarQrParseError && error.code === "UNSUPPORTED_FORMAT"
    );
});
