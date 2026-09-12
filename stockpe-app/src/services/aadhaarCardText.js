const DOB_LABEL = /\bD[O0][B8]\b|\bDATE\s+OF\s+BIRTH\b|जन्म\s*तिथि/i;
const BIRTH_LABEL = new RegExp(`${DOB_LABEL.source}|\\b(?:YEAR|YR)\\s+OF\\s+BIRTH\\b|जन्म\\s*वर्ष`, "i");
const DATE_PATTERN = /\b([0-3]?[0-9])[\/.\-]([01]?[0-9])[\/.\-]((?:19|20)[0-9]{2})\b/;
const RELATION_LABEL = /\b(?:FATHER|MOTHER|HUSBAND|WIFE|GUARDIAN|S\/O|D\/O|W\/O|C\/O)\b|पिता|माता|पति/i;
const EXCLUDED_NAME_TEXT = /AADHAAR|BIRTH|YEAR|MALE|FEMALE|VID|ENROL|ADDRESS|FATHER|MOTHER|HUSBAND|WIFE|GUARDIAN|GOVERNMENT|INDIA|BHARAT|SARKAR|ISSUE\s+DATE|सरकार/i;
const VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function isValidAadhaarNumber(value) {
    if (!/^[2-9]\d{11}$/.test(value)) return false;
    let checksum = 0;
    [...value].reverse().forEach((digit, index) => {
        checksum = VERHOEFF_D[checksum][VERHOEFF_P[index % 8][Number(digit)]];
    });
    return checksum === 0;
}

function cleanNameCandidate(value) {
    return value
        .replace(/GOVERNMENT\s+OF\s+INDIA/gi, " ")
        .replace(/\bNAME\s*:?/gi, " ")
        .replace(/[^A-Za-z .'-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function scoreNameCandidate(candidate) {
    if (
        candidate.length < 3 ||
        candidate.length > 80 ||
        EXCLUDED_NAME_TEXT.test(candidate)
    ) {
        return -1;
    }

    const words = candidate.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g) || [];
    if (words.length === 0 || words.join(" ").length < 3) return -1;

    const noisyWords = words.filter((word) => {
        const letters = word.toUpperCase().replace(/[^A-Z]/g, "");
        return (
            /^(.)\1+$/.test(letters) ||
            (letters.length >= 4 && /^(..)(?:\1)+$/.test(letters))
        );
    });
    if (noisyWords.length === words.length) return -1;

    const letters = words.join("").toUpperCase();
    const uniqueLetters = new Set(letters).size;
    const hasVowel = /[AEIOU]/.test(letters);
    if (!hasVowel || uniqueLetters < 3) return -1;

    return uniqueLetters * 2 + Math.min(letters.length, 20) - noisyWords.length * 8;
}

function parseDateOfBirth(lines) {
    const lineIndex = lines.findIndex((line) => BIRTH_LABEL.test(line));
    if (lineIndex < 0) return { dateOfBirth: "", lineIndex: -1 };

    const labelMatch = lines[lineIndex].match(BIRTH_LABEL);
    const dateText = [lines[lineIndex], lines[lineIndex + 1] || ""]
        .join(" ")
        .slice((labelMatch?.index || 0) + (labelMatch?.[0].length || 0))
        .toUpperCase()
        .replace(/[OQ]/g, "0")
        .replace(/[IL|]/g, "1")
        .replace(/S/g, "5");
    const match = dateText.match(DATE_PATTERN);
    if (!match) return { dateOfBirth: "", lineIndex };

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return { dateOfBirth: "", lineIndex };
    }

    return {
        dateOfBirth: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
        lineIndex,
    };
}

function parseAadhaarCardText(recognizedText) {
    const lines = (Array.isArray(recognizedText) ? recognizedText : [recognizedText])
        .flatMap((value) => String(value || "").split(/\r?\n/))
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);
    const aadhaarNumber = lines
        .filter((line) => !/\bVID\b/i.test(line))
        .map((line) => line.match(/\b[2-9]\d{3}[ -]+\d{4}[ -]+\d{4}\b/)?.[0])
        .filter(Boolean)
        .map((value) => value.replace(/\D/g, ""))
        .find(isValidAadhaarNumber) || "";
    const { dateOfBirth, lineIndex: dateLineIndex } = parseDateOfBirth(lines);
    let fullName = "";

    if (dateLineIndex >= 0) {
        const labelMatch = lines[dateLineIndex].match(BIRTH_LABEL);
        const sameLineCandidate = cleanNameCandidate(
            lines[dateLineIndex].slice(0, labelMatch?.index || 0)
        );
        const nearbyStart = Math.max(0, dateLineIndex - 6);
        const relationLineIndex = lines
            .slice(nearbyStart, dateLineIndex)
            .map((line, offset) => ({ index: nearbyStart + offset, line }))
            .filter(({ line }) => RELATION_LABEL.test(line))
            .at(-1)?.index;
        const nameSearchEnd = relationLineIndex ?? dateLineIndex;
        const precedingCandidates = lines
                .slice(nearbyStart, nameSearchEnd)
                .reverse()
                .map(cleanNameCandidate);
        // On bilingual cards, OCR often transliterates the Hindi birth label
        // before "DOB" into plausible-looking Latin noise. Prefer a distinct
        // name line and use the DOB-line prefix only as a fallback for OCR that
        // merged the entire card into one line.
        const candidates = [...precedingCandidates, sameLineCandidate];

        const bestCandidate = candidates
            .map((candidate, proximity) => ({
                candidate,
                score: scoreNameCandidate(candidate) - proximity * 0.25,
            }))
            .filter(({ score }) => score >= 0)
            .sort((left, right) => right.score - left.score)[0];

        if (bestCandidate) fullName = bestCandidate.candidate.toUpperCase();
    }

    return {
        aadhaarNumber,
        fullName,
        dateOfBirth,
    };
}

module.exports = { parseAadhaarCardText };
