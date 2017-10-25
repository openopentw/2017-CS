from pwn import *

host = '127.0.0.1'
port = 8888

r = remote(host, port)

def add_item(size, name):
    r.recvuntil(':')
    r.recvuntil('2')
    r.recvuntil(':')
    r.recvuntil(bytes(str(size), 'utf8'))
    r.recvuntil(':')
    r.recvuntil(bytes(name))

def show():
    r.recvuntil(':')
    r.recvuntil('1')

def change(size, name):
    r.recvuntil(':')
    r.recvuntil('3')
    r.recvuntil(':')
    r.recvuntil(bytes(str(size), 'utf8'))
    r.recvuntil(':')
    r.recvuntil(bytes(name))

def remove(size, name):
    r.recvuntil(':')
    r.recvuntil('2')
    r.recvuntil(':')
    r.recvuntil(bytes(str(size), 'utf8'))
    r.recvuntil(':')
    r.recvuntil(bytes(name))

r.interactive()
