from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
r = remote(host, port)

input('Enter')

def add_profile(name, age, len_desc, desc):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(name.encode())
    r.recvuntil(':')
    r.sendline(str(age).encode())
    r.recvuntil(':')
    r.sendline(str(len_desc).encode())
    r.recvuntil(':')
    r.sendline(desc)

def show_profile(idx):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(idx).encode())

def edit_profile(idx, name, age, desc):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(idx).encode())
    r.recvuntil(':')
    r.sendline(name.encode())
    r.recvuntil(':')
    r.sendline(str(age).encode())
    r.recvuntil(':')
    r.sendline(desc.encode())

def delete_profile(idx):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(idx).encode())

r.interactive()
