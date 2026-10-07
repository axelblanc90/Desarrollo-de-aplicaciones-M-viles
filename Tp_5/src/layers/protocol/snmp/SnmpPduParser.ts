import { SnmpVarBind } from './types';

/**
 * ASN.1 Basic Encoding Rules (BER) Tags
 */
const BER_TAGS = {
  INTEGER: 0x02,
  OCTET_STRING: 0x04,
  NULL: 0x05,
  OBJECT_IDENTIFIER: 0x06,
  SEQUENCE: 0x30,
  IP_ADDRESS: 0x40,
  COUNTER32: 0x41,
  GAUGE32: 0x42,
  TIMETICKS: 0x43,
  GET_REQUEST_PDU: 0xa0,
  GET_RESPONSE_PDU: 0xa2,
};

export class SnmpPduParser {
  /**
   * Builds an SNMP v2c GetRequest PDU encoded in ASN.1 BER
   */
  static buildGetRequest(community: string = 'public', requestId: number = 1001, oids: string[]): Uint8Array {
    // 1. Build VarBindList
    const varBindBuffers: Uint8Array[] = [];
    for (const oid of oids) {
      const oidEncoded = this.encodeOid(oid);
      const nullValue = new Uint8Array([BER_TAGS.NULL, 0x00]); // NULL tag
      const varBind = this.wrapInTlv(
        BER_TAGS.SEQUENCE,
        this.concatBuffers([oidEncoded, nullValue])
      );
      varBindBuffers.push(varBind);
    }
    const varBindList = this.wrapInTlv(BER_TAGS.SEQUENCE, this.concatBuffers(varBindBuffers));

    // 2. Build PDU Body: RequestID, ErrorStatus(0), ErrorIndex(0), VarBindList
    const reqIdBuf = this.encodeInteger(requestId);
    const errStatusBuf = this.encodeInteger(0);
    const errIndexBuf = this.encodeInteger(0);

    const pduBody = this.concatBuffers([reqIdBuf, errStatusBuf, errIndexBuf, varBindList]);
    const pdu = this.wrapInTlv(BER_TAGS.GET_REQUEST_PDU, pduBody);

    // 3. Wrap in SNMP Message: Version(1 = v2c), Community, PDU
    const versionBuf = this.encodeInteger(1); // 0=v1, 1=v2c
    const communityBuf = this.encodeOctetString(community);

    const messageBody = this.concatBuffers([versionBuf, communityBuf, pdu]);
    return this.wrapInTlv(BER_TAGS.SEQUENCE, messageBody);
  }

  /**
   * Decodes an SNMP GetResponse PDU byte buffer into structured VarBinds
   */
  static parseResponse(buffer: Uint8Array): { requestId: number; varbinds: SnmpVarBind[] } {
    let offset = 0;

    // 1. Root SEQUENCE
    if (buffer[offset++] !== BER_TAGS.SEQUENCE) {
      throw new Error('Invalid SNMP Packet: Root is not an ASN.1 SEQUENCE');
    }
    offset = this.skipLength(buffer, offset);

    // 2. Version
    if (buffer[offset++] !== BER_TAGS.INTEGER) {
      throw new Error('Expected Version INTEGER tag');
    }
    const versionLen = buffer[offset++];
    offset += versionLen;

    // 3. Community String
    if (buffer[offset++] !== BER_TAGS.OCTET_STRING) {
      throw new Error('Expected Community OCTET STRING tag');
    }
    const communityLen = buffer[offset++];
    offset += communityLen;

    // 4. PDU (GetResponse: 0xA2)
    const pduTag = buffer[offset++];
    if (pduTag !== BER_TAGS.GET_RESPONSE_PDU && pduTag !== 0xa0) {
      throw new Error(`Expected GetResponse PDU (0xA2), received: 0x${pduTag.toString(16)}`);
    }
    offset = this.skipLength(buffer, offset);

    // 5. Request ID
    if (buffer[offset++] !== BER_TAGS.INTEGER) throw new Error('Expected RequestID tag');
    const reqIdLen = buffer[offset++];
    let requestId = 0;
    for (let i = 0; i < reqIdLen; i++) {
      requestId = (requestId << 8) | buffer[offset++];
    }

    // 6. Error Status & Error Index
    offset += 3; // Integer tag, len, val (error-status)
    offset += 3; // Integer tag, len, val (error-index)

    // 7. VarBindList SEQUENCE
    if (buffer[offset++] !== BER_TAGS.SEQUENCE) throw new Error('Expected VarBindList SEQUENCE');
    offset = this.skipLength(buffer, offset);

    const varbinds: SnmpVarBind[] = [];

    // Parse each VarBind SEQUENCE
    while (offset < buffer.length) {
      if (buffer[offset++] !== BER_TAGS.SEQUENCE) break;
      offset = this.skipLength(buffer, offset);

      // OID
      if (buffer[offset++] !== BER_TAGS.OBJECT_IDENTIFIER) break;
      const oidLen = buffer[offset++];
      const oidBytes = buffer.slice(offset, offset + oidLen);
      offset += oidLen;
      const oid = this.decodeOid(oidBytes);

      // Value Tag
      const valTag = buffer[offset++];
      const valLen = buffer[offset++];
      const valBytes = buffer.slice(offset, offset + valLen);
      offset += valLen;

      let value: string | number = '';
      let typeName = 'UNKNOWN';

      if (valTag === BER_TAGS.OCTET_STRING) {
        typeName = 'OCTET_STRING';
        value = new TextDecoder('utf-8').decode(valBytes);
      } else if (valTag === BER_TAGS.INTEGER || valTag === BER_TAGS.COUNTER32 || valTag === BER_TAGS.TIMETICKS) {
        typeName = valTag === BER_TAGS.TIMETICKS ? 'TIMETICKS' : 'INTEGER';
        let num = 0;
        for (let b of valBytes) num = (num << 8) | b;
        value = num;
      } else {
        typeName = `TAG_0x${valTag.toString(16)}`;
        value = Array.from(valBytes).map(b => b.toString(16).padStart(2, '0')).join(':');
      }

      varbinds.push({ oid, type: typeName, value });
    }

    return { requestId, varbinds };
  }

  // --- BER Helper Methods ---

  private static encodeInteger(val: number): Uint8Array {
    let hex = Math.abs(val).toString(16);
    if (hex.length % 2 !== 0) hex = '0' + hex;
    const len = hex.length / 2;
    const out = new Uint8Array(2 + len);
    out[0] = BER_TAGS.INTEGER;
    out[1] = len;
    for (let i = 0; i < len; i++) {
      out[2 + i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
  }

  private static encodeOctetString(str: string): Uint8Array {
    const bytes = new TextEncoder().encode(str);
    const out = new Uint8Array(2 + bytes.length);
    out[0] = BER_TAGS.OCTET_STRING;
    out[1] = bytes.length;
    out.set(bytes, 2);
    return out;
  }

  private static encodeOid(oidStr: string): Uint8Array {
    const parts = oidStr.split('.').map(Number);
    if (parts.length < 2) return new Uint8Array([BER_TAGS.OBJECT_IDENTIFIER, 0]);

    const bytes: number[] = [];
    // First two sub-identifiers are encoded as: (X * 40) + Y
    bytes.push(parts[0] * 40 + parts[1]);

    for (let i = 2; i < parts.length; i++) {
      let val = parts[i];
      if (val < 128) {
        bytes.push(val);
      } else {
        const subBytes: number[] = [];
        subBytes.push(val & 0x7f);
        val >>= 7;
        while (val > 0) {
          subBytes.push((val & 0x7f) | 0x80);
          val >>= 7;
        }
        bytes.push(...subBytes.reverse());
      }
    }

    const out = new Uint8Array(2 + bytes.length);
    out[0] = BER_TAGS.OBJECT_IDENTIFIER;
    out[1] = bytes.length;
    out.set(bytes, 2);
    return out;
  }

  private static decodeOid(bytes: Uint8Array): string {
    if (bytes.length === 0) return '';
    const parts: number[] = [];
    parts.push(Math.floor(bytes[0] / 40));
    parts.push(bytes[0] % 40);

    let val = 0;
    for (let i = 1; i < bytes.length; i++) {
      const b = bytes[i];
      val = (val << 7) | (b & 0x7f);
      if ((b & 0x80) === 0) {
        parts.push(val);
        val = 0;
      }
    }
    return parts.join('.');
  }

  private static wrapInTlv(tag: number, content: Uint8Array): Uint8Array {
    const len = content.length;
    if (len < 128) {
      const out = new Uint8Array(2 + len);
      out[0] = tag;
      out[1] = len;
      out.set(content, 2);
      return out;
    } else {
      // Long form length
      const out = new Uint8Array(3 + len);
      out[0] = tag;
      out[1] = 0x81; // 1 length byte follows
      out[2] = len;
      out.set(content, 3);
      return out;
    }
  }

  private static skipLength(buffer: Uint8Array, offset: number): number {
    const lenByte = buffer[offset++];
    if ((lenByte & 0x80) !== 0) {
      const numOctets = lenByte & 0x7f;
      offset += numOctets;
    }
    return offset;
  }

  private static concatBuffers(buffers: Uint8Array[]): Uint8Array {
    const totalLen = buffers.reduce((acc, b) => acc + b.length, 0);
    const out = new Uint8Array(totalLen);
    let offset = 0;
    for (const b of buffers) {
      out.set(b, offset);
      offset += b.length;
    }
    return out;
  }
}
