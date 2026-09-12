const test = require("node:test");
const assert = require("node:assert/strict");
const { parseAadhaarCardText } = require("../src/services/aadhaarCardText");

test("extracts the editable fields from Aadhaar front text", () => {
    assert.deepEqual(
        parseAadhaarCardText([
            "Government of India",
            "ARJUN KUMAR",
            "DOB: 7-4-1992",
            "Male",
            "2345 6789 0124",
        ]),
        {
            aadhaarNumber: "234567890124",
            fullName: "ARJUN KUMAR",
            dateOfBirth: "07/04/1992",
        }
    );
});

test("does not invent fields from unrelated or incomplete text", () => {
    assert.deepEqual(parseAadhaarCardText(["Government of India", "Year of Birth: 1992"]), {
        aadhaarNumber: "",
        fullName: "",
        dateOfBirth: "",
    });
});

test("reads the name on a Year of Birth Aadhaar without inventing a full DOB", () => {
    assert.deepEqual(
        parseAadhaarCardText([
            "भारत सरकार",
            "GOVERNMENT OF INDIA",
            "धापु बाई",
            "Dhapu Bai",
            "पिता : हेमराज बागड़ी",
            "Father : Hemraj Bagri",
            "जन्म वर्ष / Year of Birth : 2008",
            "महिला / Female",
            "3722 6454 0039",
        ]),
        {
            aadhaarNumber: "372264540039",
            fullName: "DHAPU BAI",
            dateOfBirth: "",
        }
    );
});

test("reads a full DOB and name from the newer Aadhaar layout", () => {
    const result = parseAadhaarCardText([
        "Government of India",
        "Subhash Singh",
        "D0B : 05/04/2005",
        "Male",
        "4422 0594 6619",
    ]);

    assert.equal(result.fullName, "SUBHASH SINGH");
    assert.equal(result.dateOfBirth, "05/04/2005");
});

test("reads a DOB printed on the line following its label", () => {
    const result = parseAadhaarCardText([
        "Government of India",
        "Subhash Singh",
        "Date of Birth",
        "05-04-2005",
    ]);

    assert.equal(result.fullName, "SUBHASH SINGH");
    assert.equal(result.dateOfBirth, "05/04/2005");
});

test("does not mistake a separately detected father name for the cardholder name", () => {
    const result = parseAadhaarCardText([
        "Government of India",
        "Dhapu Bai",
        "Father",
        "Hemraj Bagri",
        "Year of Birth: 2008",
    ]);

    assert.equal(result.fullName, "DHAPU BAI");
});

test("does not use a government header as the name", () => {
    const result = parseAadhaarCardText([
        "Bharat Sarkar",
        "Government of India",
        "DOB: 05/04/2005",
    ]);

    assert.equal(result.fullName, "");
});

test("rejects repeated-glyph OCR noise and selects the credible Latin name", () => {
    const result = parseAadhaarCardText([
        "Government of India",
        "Subhash Singh",
        "GG FAFA",
        "DOB: 05/04/2005",
    ]);

    assert.equal(result.fullName, "SUBHASH SINGH");
    assert.equal(parseAadhaarCardText(["GG FAFA", "DOB: 05/04/2005"]).fullName, "");
});

test("preserves Aadhaar names with more than two parts", () => {
    const result = parseAadhaarCardText([
        "Government of India",
        "Mohammed Abdul Rahman Khan",
        "DOB: 05/04/2005",
    ]);

    assert.equal(result.fullName, "MOHAMMED ABDUL RAHMAN KHAN");
});

test("prefers the English name above a bilingual DOB row over OCR noise on that row", () => {
    const result = parseAadhaarCardText([
        "Issue Date: 05/12/2012",
        "Government of India",
        "साहिल गर्ग",
        "Sahil Garg",
        "GG FAFA DOB: 03/08/2004",
        "पुरुष / MALE",
        "2345 6789 0124",
        "VID: 9155 7663 5665 2409",
    ]);

    assert.equal(result.fullName, "SAHIL GARG");
    assert.equal(result.dateOfBirth, "03/08/2004");
});

test("reads a name sharing an OCR line with DOB and corrects confused DOB digits", () => {
    const result = parseAadhaarCardText([
        "Government of India ARJUN KUMAR D0B: O7-O4-1992",
        "1234 5678 9012",
    ]);

    assert.equal(result.fullName, "ARJUN KUMAR");
    assert.equal(result.dateOfBirth, "07/04/1992");
});

test("ignores issue dates and rejects impossible labelled birth dates", () => {
    assert.equal(
        parseAadhaarCardText(["Issue Date: 01/02/2024", "ARJUN KUMAR", "DOB: 31/02/1992"]).dateOfBirth,
        ""
    );
});

test("rejects misread Aadhaar numbers and does not use digits from a VID", () => {
    assert.equal(parseAadhaarCardText(["2345 6789 0123"]).aadhaarNumber, "");
    assert.equal(parseAadhaarCardText(["VID: 2345 6789 0124"]).aadhaarNumber, "");
});
