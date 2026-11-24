// GTU Computer Networks: IPv4 subnetting, fixed-size subnets and VLSM. MIT licence.
const F = {
  ipToInt(s) {
    const p = s.trim().split('.');
    if (p.length !== 4 || p.some(x => !/^\d{1,3}$/.test(x) || +x > 255)) throw new Error('not a valid IPv4 address: ' + s);
    return p.reduce((a, x) => a * 256 + +x, 0);
  },
  intToIp(n) { return [24, 16, 8, 0].map(s => Math.floor(n / 2 ** s) % 256).join('.'); },
  maskInt(prefix) { return prefix === 0 ? 0 : (2 ** 32 - 2 ** (32 - prefix)); },
  parseCidr(s) {
    const m = s.trim().match(/^([\d.]+)\s*\/\s*(\d{1,2})$/);
    if (!m || +m[2] > 32) throw new Error('write it like 192.168.10.77/27');
    return { ip: F.ipToInt(m[1]), prefix: +m[2] };
  },
  classOf(ip) {
    const o = Math.floor(ip / 2 ** 24);
    if (o < 128) return 'A (default /8)'; if (o < 192) return 'B (default /16)'; if (o < 224) return 'C (default /24)';
    if (o < 240) return 'D (multicast)'; return 'E (reserved)';
  },
  isPrivate(ip) {
    const a = Math.floor(ip / 2 ** 24), b = Math.floor(ip / 2 ** 16) % 256;
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  },
  info(ip, prefix) {
    const size = 2 ** (32 - prefix);
    const network = Math.floor(ip / size) * size, broadcast = network + size - 1;
    let usable, first, last;
    if (prefix <= 30) { usable = size - 2; first = network + 1; last = broadcast - 1; }
    else if (prefix === 31) { usable = 2; first = network; last = broadcast; } // RFC 3021 point-to-point
    else { usable = 1; first = last = network; }
    return {
      network: F.intToIp(network), broadcast: F.intToIp(broadcast), first: F.intToIp(first), last: F.intToIp(last),
      mask: F.intToIp(F.maskInt(prefix)), wildcard: F.intToIp(2 ** 32 - 1 - F.maskInt(prefix)),
      prefix, size, usable, cls: F.classOf(ip), private: F.isPrivate(ip), networkInt: network
    };
  },
  // split a block into at least `count` equal subnets
  split(ip, prefix, count) {
    if (!Number.isInteger(count) || count < 1) throw new Error('number of subnets must be a whole number >= 1');
    const borrow = Math.ceil(Math.log2(count));
    const np = prefix + borrow;
    if (np > 32) throw new Error('not enough host bits to make ' + count + ' subnets');
    const base = F.info(ip, prefix).networkInt, size = 2 ** (32 - np);
    const list = [];
    for (let i = 0; i < 2 ** borrow; i++) list.push(F.info(base + i * size, np));
    return { borrow, newPrefix: np, total: 2 ** borrow, list };
  },
  // VLSM: biggest requirement first, each block = smallest power of 2 >= hosts + 2
  vlsm(ip, prefix, needs) {
    const base = F.info(ip, prefix).networkInt, end = base + 2 ** (32 - prefix);
    const order = needs.map((h, i) => ({ h, i })).sort((a, b) => b.h - a.h || a.i - b.i);
    let cur = base; const out = [];
    for (const { h, i } of order) {
      if (!Number.isInteger(h) || h < 1) throw new Error('host counts must be whole numbers >= 1');
      let bits = 2; while (2 ** bits - 2 < h) bits++;
      const p = 32 - bits;
      if (cur + 2 ** bits > end) throw new Error('does not fit: ran out of space at the ' + h + ' host subnet');
      out.push({ need: h, index: i, ...F.info(cur, p) });
      cur += 2 ** bits;
    }
    return { list: out, free: end - cur };
  }
};
if (typeof module !== 'undefined') module.exports = F;
