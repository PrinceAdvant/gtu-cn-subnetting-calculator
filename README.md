# GTU Computer Networks 3150710 subnetting calculator: network, broadcast, hosts, equal subnets and VLSM

Subnetting is pure arithmetic, but one wrong block size and every address after it is wrong. IP with /prefix daalo and the page gives network, broadcast, first and last host, mask, wildcard and class. It can also split a block into N equal subnets or do VLSM for a list of host counts, with the full allocation table. Practice values are my own.

Live page: https://princeadvant.github.io/gtu-cn-subnetting-calculator/

## Facts used

- Block size = 2^(32 - prefix). Network address = IP rounded down to a multiple of the block size in the interesting octet.
- Broadcast = network + block size - 1. Usable hosts = block size - 2 for prefixes up to /30.
- /31 links have 2 usable addresses (RFC 3021, point to point) and /32 is a single host. Old textbooks say 0 for /31, so mention both if asked.
- To make N equal subnets, borrow b bits where 2^b >= N. Each borrowed bit halves the block.
- VLSM: sort requirements largest first. Each subnet gets the smallest block with block - 2 >= hosts, placed at the next free aligned address.
- Default example: 192.168.10.77/27 has block 32, network 192.168.10.64, broadcast 192.168.10.95, hosts .65 to .94 (30 usable).

## Test

`node test.js` checks /27, /8, /32 and /0 blocks, a /16 split into 6 subnets (borrow 3 bits, /19) and a VLSM plan for 100, 50 and 25 hosts, and prints `All checks passed`.

## Tips

- Write the mask in both forms (/27 and 255.255.255.224). A question may give one and ask for the other.
- Show the block size first. Every later number follows from it, so the examiner can give step marks.
- For VLSM, always allocate the biggest network first. Starting small breaks alignment and wastes space.
- Private ranges: 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16.

## Practice with the real paper

GTU Hero has the Winter 2025 Computer Networks (3150710) paper page: 70 marks and 25 questions extracted. Open it here: [https://gtuhero.com/gtu-papers/gujarat-technological-university-3150710-computer-networks-winter-2025](https://gtuhero.com/gtu-papers/gujarat-technological-university-3150710-computer-networks-winter-2025) (GTU Hero is my project).

## Licence

MIT
