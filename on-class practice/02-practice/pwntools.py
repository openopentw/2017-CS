import sys

from pwn import *

write = sys.stdout.buffer.write

host = 'csie.ctf.tw'
port = 10123

r = remote(host, port)

sml = 1
big = 50000000
# num = 25000000

times = 0
while True:
    print(times)
    times += 1

    r.recvuntil(' = ')
    # r.sendline(b'25000000')
    med = (sml + big) // 2
    write(str(med).encode('utf-8') + b'\n')
    r.sendline(str(med).encode('utf-8'))

    # if times == 2:
    #     break

    recv = r.recvuntil('\n')
    # write(b'{start}' + recv + b'{end}')
    if recv == b"It's too big\n":
        print('big')
        big = med
    elif recv == b"It's too small\n":
        print('small')
        sml = med
    else:
        print('=== break ===')
        write(b'{start}' + recv + b'{end}')
        print('=== break ===')
        break

r.interactive()
