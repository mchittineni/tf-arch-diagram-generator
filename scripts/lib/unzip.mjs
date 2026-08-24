/**
 * Minimal, dependency-free ZIP reader.
 *
 * The icon bundles are plain deflate/store archives, so parsing the central
 * directory and inflating with `node:zlib` is enough — this keeps the project's
 * zero-dependency promise and works identically on Linux, macOS and Windows
 * (no reliance on an `unzip` binary being installed).
 */

import { inflateRawSync } from 'node:zlib';

const SIG_EOCD = 0x06054b50;
const SIG_EOCD64_LOCATOR = 0x07064b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;

/**
 * @param {Buffer} buffer a complete ZIP archive
 * @returns {Array<{name: string, data: Buffer}>} file entries (directories omitted)
 */
export function unzip(buffer) {
  const eocd = findEndOfCentralDirectory(buffer);
  let entryCount = buffer.readUInt16LE(eocd + 10);
  let centralOffset = buffer.readUInt32LE(eocd + 16);

  // ZIP64: the 32-bit fields saturate, and the real values live in the
  // ZIP64 end-of-central-directory record.
  if (entryCount === 0xffff || centralOffset === 0xffffffff) {
    ({ entryCount, centralOffset } = readZip64(buffer, eocd));
  }

  const entries = [];
  let cursor = centralOffset;

  for (let i = 0; i < entryCount; i += 1) {
    if (buffer.readUInt32LE(cursor) !== SIG_CENTRAL) {
      throw new Error(`Corrupt ZIP: bad central directory entry at offset ${cursor}`);
    }

    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength);

    cursor += 46 + nameLength + extraLength + commentLength;

    if (name.endsWith('/')) continue; // directory entry

    entries.push({ name, data: readLocalEntry(buffer, localOffset, compressionMethod, compressedSize) });
  }

  return entries;
}

function readLocalEntry(buffer, localOffset, compressionMethod, compressedSize) {
  if (buffer.readUInt32LE(localOffset) !== SIG_LOCAL) {
    throw new Error(`Corrupt ZIP: bad local header at offset ${localOffset}`);
  }
  const nameLength = buffer.readUInt16LE(localOffset + 26);
  const extraLength = buffer.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + nameLength + extraLength;
  const raw = buffer.subarray(dataStart, dataStart + compressedSize);

  if (compressionMethod === 0) return Buffer.from(raw);
  if (compressionMethod === 8) return inflateRawSync(raw);
  throw new Error(`Unsupported ZIP compression method: ${compressionMethod}`);
}

function findEndOfCentralDirectory(buffer) {
  // The EOCD sits at the end, after an optional comment of up to 64 KiB.
  const minOffset = Math.max(0, buffer.length - 0xffff - 22);
  for (let i = buffer.length - 22; i >= minOffset; i -= 1) {
    if (buffer.readUInt32LE(i) === SIG_EOCD) return i;
  }
  throw new Error('Not a ZIP archive: end-of-central-directory record not found');
}

function readZip64(buffer, eocd) {
  for (let i = eocd - 20; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === SIG_EOCD64_LOCATOR) {
      const zip64Offset = Number(buffer.readBigUInt64LE(i + 8));
      return {
        entryCount: Number(buffer.readBigUInt64LE(zip64Offset + 32)),
        centralOffset: Number(buffer.readBigUInt64LE(zip64Offset + 48))
      };
    }
  }
  throw new Error('Corrupt ZIP: ZIP64 locator not found');
}
